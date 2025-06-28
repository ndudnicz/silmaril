using Api.Entities;
using Api.Entities.Dtos;
using Api.Exceptions;
using Api.Repositories;
using Api.Services;
using FluentAssertions;
using Moq;

namespace Tests.Services
{
    public class LoginServiceTests
    {
        private readonly Mock<ILoginRepository> _loginRepository = new();
        private readonly Mock<ITagRepository> _tagRepository = new();
        private readonly Mock<IUserRepository> _userRepository = new();

        private LoginService CreateService() =>
            new(_loginRepository.Object, new TagService(_tagRepository.Object), _userRepository.Object);

        [Fact]
        public async Task CreateLoginAsync_WithTags_ShouldReturnLoginDto()
        {
            var createDto = new CreateLoginDto { TagNames = new[] { "tag1" } };
            var login = new Login { Id = Guid.NewGuid(), Tags = new List<Tag>() };
            _tagRepository.Setup(t => t.GetTagsByNamesAsync(It.IsAny<string[]>()))
                .ReturnsAsync(new List<Tag> { new() { Name = "tag1" } });
            _loginRepository.Setup(r => r.CreateLoginAsync(It.IsAny<Login>()))
                .ReturnsAsync(login);

            var service = CreateService();
            var result = await service.CreateLoginAsync(createDto, Guid.NewGuid());

            result.Should().NotBeNull();
            result.Id.Should().Be(login.Id);
        }

        [Fact]
        public async Task UpdateLoginAsync_WhenUserNotFound_ShouldThrow()
        {
            _userRepository.Setup(r => r.UserExistsAsync(It.IsAny<Guid>()))
                .ReturnsAsync(false);

            var service = CreateService();
            Func<Task> act = async () => await service.UpdateLoginAsync(new UpdateLoginDto(), Guid.NewGuid());

            await act.Should().ThrowAsync<UserNotFound>();
        }

        [Fact]
        public async Task DeleteLoginByUserIdAsync_ShouldReturnCount()
        {
            _loginRepository.Setup(r => r.DeleteLoginByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
                .ReturnsAsync(1);

            var service = CreateService();
            var result = await service.DeleteLoginByUserIdAsync(Guid.NewGuid(), Guid.NewGuid());

            result.Should().Be(1);
        }
        
        [Fact]
        public async Task CreateLoginAsync_WhenTagsNotFound_ShouldThrow()
        {
            var createDto = new CreateLoginDto { TagNames = new[] { "inexistant" } };
            _tagRepository.Setup(t => t.GetTagsByNamesAsync(It.IsAny<string[]>()))
                .ReturnsAsync(new List<Tag>());

            var service = CreateService();
            Func<Task> act = async () => await service.CreateLoginAsync(createDto, Guid.NewGuid());

            await act.Should().ThrowAsync<TagsNotFound>();
        }
        
        [Fact]
        public async Task DeleteLoginByUserIdAsync_WhenNoLoginDeleted_ShouldReturnZero()
        {
            _loginRepository.Setup(r => r.DeleteLoginByUserIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
                .ReturnsAsync(0);

            var service = CreateService();
            var result = await service.DeleteLoginByUserIdAsync(Guid.NewGuid(), Guid.NewGuid());

            result.Should().Be(0);
        }
    }
}