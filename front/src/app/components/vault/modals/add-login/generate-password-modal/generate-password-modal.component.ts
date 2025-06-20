import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


enum PasswordStyle {
  Readable = 'readable',
  NotReadable = 'not-readable'
}

interface PasswordOptions {
  minLength?: number;
  style?: PasswordStyle;
  letters?: boolean;
  numbers?: boolean;
  specialChar?: boolean;
  useWords?: boolean;
}

@Component({
  selector: 'app-generate-password-modal',
  imports: [],
  templateUrl: './generate-password-modal.component.html',
  styleUrl: './generate-password-modal.component.css'
})
export class GeneratePasswordModalComponent {

  dialogRef = inject(MatDialogRef);
  private minLength = 32;

  constructor() {
    console.log('GeneratePasswordModalComponent initialized');
  }

  onSubmit() {
    this.dialogRef.close(this.generatePassword({
      minLength: this.minLength,
      style: PasswordStyle.Readable,
      letters: true,
      numbers: true,
      specialChar: true,
      useWords: true
    }));
  }

  generatePassword(options: PasswordOptions = {
    minLength: this.minLength,
    style: PasswordStyle.NotReadable,
    letters: true,
    numbers: true,
    specialChar: true,
    useWords: false
  }): string {
    // Base sets
    const length = options.minLength || this.minLength;
    const style = options.style || PasswordStyle.NotReadable;
    const letters = options.letters !== undefined ? options.letters : true;
    const numbers = options.numbers !== undefined ? options.numbers : true;
    const specialChar = options.specialChar !== undefined ? options.specialChar : true;
    const useWords = options.useWords !== undefined ? options.useWords : false;

    const allLettersSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const readableLettersSet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';  // sans i, l, o
    const numbersChars = '0123456789';
    const readableNumbers = '23456789'; // sans 0,1
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    // Liste de mots simples (exemple réduit, tu peux remplacer par ta liste)
    const simpleWords = [
      // mots génériques déjà présents
      'cat', 'dog', 'bird', 'fish', 'tree', 'book', 'red', 'blue', 'sun', 'moon', 'star',
      'fire', 'rock', 'wind', 'rain', 'snow', 'leaf', 'cloud', 'frog', 'bear', 'lion', 'wolf',
      'frog', 'ant', 'bee', 'bat', 'owl', 'fox', 'cow', 'pig', 'rat', 'hen', 'bee', 'bee',
      'cup', 'pen', 'key', 'box', 'car', 'bus', 'van', 'jet', 'sky', 'sea', 'lake', 'pond',
      'hill', 'path', 'road', 'door', 'wall', 'roof', 'farm', 'barn', 'yard', 'park', 'play',
      'walk', 'run', 'jump', 'swim', 'read', 'sing', 'song', 'tree', 'wood', 'seed', 'root',
      'leaf', 'rose', 'tulip', 'daisy', 'lily', 'cafe', 'food', 'milk', 'cake', 'salt', 'soup',
      'rice', 'fish', 'meat', 'bird', 'frog', 'ant', 'bee', 'cow', 'dog', 'cat', 'rat', 'bat',
      'egg', 'oil', 'tea', 'jam', 'pie', 'pot', 'pan', 'cup', 'lid', 'bin', 'mat', 'rug', 'bed',
      'box', 'bag', 'hat', 'cap', 'sun', 'sky', 'sea', 'ice', 'mud', 'wax', 'web', 'net', 'zip',
      'key', 'log', 'map', 'toy', 'car', 'bus', 'van', 'jet', 'cab', 'taxi', 'bike', 'boat',

      'hobbit', 'shire', 'gandalf', 'frodo', 'samwise', 'aragorn', 'legolas', 'gimli', 'boromir',
      'sauron', 'mordor', 'rivendell', 'gollum', 'balrog', 'elf', 'dwarf', 'orc', 'ring', 'ent',
      'rohan', 'isengard', 'mithril', 'galadriel', 'saruman', 'elfstone', 'numenor', 'anduril',
      'barad-dur', 'pelennor', 'urgal', 'lothlorien', 'shirefolk', 'warg', 'troll', 'oden',
      'beren', 'melkor', 'valar', 'maiar', 'eowyn', 'faramir', 'glorfindel', 'silmaril', 'eldar',
      'durin', 'noldor', 'dunedain', 'gwaith', 'ithilien', 'angmar', 'turin', 'hurin', 'morwen',
      'beleg', 'feanor', 'fingolfin', 'finrod', 'tulkas', 'ulmo', 'manwe', 'yavanna', 'mandos',
      'nerevar', 'tinuviel', 'elbereth', 'earendil', 'melian', 'namarie', 'celebrimbor', 'earendil',
      'gil-galad', 'ancalagon', 'maeglin', 'thalion', 'thorondor', 'glaurung', 'varda', 'nienna',
      'mandos', 'luthien', 'beleriand', 'feanorian', 'ornament', 'silmarils', 'angband', 'dagor',
      'nargothrond', 'dol-guldur', 'mirrormere', 'telerin', 'aeglos', 'rohirrim', 'glorfindel',
      'morgoth', 'gondolin', 'helcaraxe', 'noldorin', 'valinor', 'tol-in-galduroth', 'aegnor',
      'finwe', 'fingon', 'galathilion', 'haldir', 'hithlum', 'lothlann', 'gorthaur', 'annatar',
      'narsil', 'vilya', 'narya'
    ];

    // Génère un charset lettres selon options style et uppercase
    function getLetterCharset() {
      let lettersSet = '';
      if (style === PasswordStyle.Readable) {
        lettersSet = readableLettersSet;
      } else {
        lettersSet = allLettersSet;
      }
      return lettersSet;
    }

    if (!letters && !numbers && !specialChar && !useWords) {
      throw new Error('At least one character type or useWords must be selected.');
    }

    if (useWords) {
      let password = '';
      while (password.length < length) {
        if (password.length > 0) password += '-';
        let word = simpleWords[Math.floor(Math.random() * simpleWords.length)];
        word = word.charAt(0).toUpperCase() + word.slice(1);

        let insertChars = '';
        const charsToAdd = 1;
        const charsetParts = [];
        if (specialChar) charsetParts.push(specialChars);
        const charset = charsetParts.join('');
        for (let i = 0; i < charsToAdd; i++) {
          insertChars += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        if (numbers) {
          let insertNumbers = '';
          const numberSetPart = [];
          numberSetPart.push(style === PasswordStyle.Readable ? readableNumbers : numbersChars);
          const numbersToAdd = 2;
          const numberSet = numberSetPart.join('');
          for (let i = 0; i < numbersToAdd; i++) {
            insertNumbers += numberSet.charAt(Math.floor(Math.random() * numberSet.length));
          }
          word += insertNumbers;
        }

        password += word + insertChars;
      }
      return password;
    }

    // Génération classique
    let charset = '';
    if (letters) charset += getLetterCharset();
    if (numbers) charset += style === 'readable' ? readableNumbers : numbersChars;
    if (specialChar) charset += specialChars;

    if (!charset) {
      throw new Error('At least one character type must be selected.');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}
