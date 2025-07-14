import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../../progress-bar/progress-bar.component';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';


interface PasswordOptions {
  minLength?: number;
  readable?: boolean;
  letters?: boolean;
  numbers?: boolean;
  specialChar?: boolean;
  useWords?: boolean;
}

enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  GOOD = 'good',
  STRONG = 'strong'
}

@Component({

  selector: 'app-generate-password-modal',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressBarModule,
    CommonModule,
    ProgressBarComponent
  ],
  templateUrl: './generate-password-modal.component.html',
  styleUrl: './generate-password-modal.component.css'
})
export class GeneratePasswordModalComponent extends BaseModalComponent implements OnInit {

  private defaultMinLength = 32;
  minLength = 8;
  specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  minLengthFormControl = new FormControl(this.defaultMinLength, { nonNullable: true, validators: [Validators.min(this.minLength)] });
  readableFormControl = new FormControl(false, { nonNullable: true });
  lettersFormControl = new FormControl(true, { nonNullable: true });
  numbersFormControl = new FormControl(true, { nonNullable: true });
  specialCharFormControl = new FormControl(true, { nonNullable: true });
  useWordsFormControl = new FormControl("true", { nonNullable: true });
  generatedPassword = this.generatePassword({
    minLength: this.minLengthFormControl.value || this.defaultMinLength,
    readable: this.readableFormControl.value,
    letters: this.lettersFormControl.value,
    numbers: this.numbersFormControl.value,
    specialChar: this.specialCharFormControl.value,
    useWords: this.useWordsFormControl.value === 'true'
  });
  formGeneratePassword: FormGroup = new FormGroup({
    minLengthFormControl: this.minLengthFormControl,
    readableFormControl: this.readableFormControl,
    lettersFormControl: this.lettersFormControl,
    numbersFormControl: this.numbersFormControl,
    specialCharFormControl: this.specialCharFormControl,
    useWordsFormControl: this.useWordsFormControl
  });

  progressBarColors = {
    [PasswordStrength.WEAK]: '#ed6161',
    [PasswordStrength.MEDIUM]: '#e8b53c',
    [PasswordStrength.GOOD]: '#60b582',
    [PasswordStrength.STRONG]: '#00966f'
  }
  progressBarValue = 0;
  progressBarColor = this.progressBarColors[PasswordStrength.WEAK];
  passwordStrength = PasswordStrength.WEAK.toString();

  constructor() {
    super(
      inject(MatDialogRef<GeneratePasswordModalComponent>),
      inject(NgxSpinnerService)
    );
  }

  ngOnInit(): void {
    this.formGeneratePassword.valueChanges.subscribe(this.setNewPassword.bind(this));
    this.setProgressPasswordStrengthValues();
  }

  minLengthValidator(control: FormControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (value < 8) {
      return { 'minLength': true };
    }
    return null;
  }

  onSubmit(): void {
    this.dialogRef.close(this.generatedPassword);
  }

  setNewPassword(): void {
    if (this.formGeneratePassword.valid) {
      this.generatedPassword = this.generatePassword({
        minLength: this.minLengthFormControl.value || this.defaultMinLength,
        readable: this.readableFormControl.value,
        letters: this.lettersFormControl.value,
        numbers: this.numbersFormControl.value,
        specialChar: this.specialCharFormControl.value,
        useWords: this.useWordsFormControl.value === 'true'
      });
      this.formGeneratePassword.markAsPristine();
      this.setProgressPasswordStrengthValues();
    }
  }

  generatePassword(options: PasswordOptions = {
    minLength: this.defaultMinLength,
    readable: false,
    letters: true,
    numbers: true,
    specialChar: true,
    useWords: true
  }): string {
    const length = options.minLength || this.defaultMinLength;
    const readable = options.readable;
    const letters = options.letters;
    const numbers = options.numbers;
    const specialChar = options.specialChar;
    const useWords = options.useWords;

    const allLettersSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const readableLettersSet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';  // without i, l, o
    const numbersChars = '0123456789';
    const readableNumbers = '23456789'; // without 0,1
    const specialChars = this.specialChars;

    const simpleWords = [
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

    function getLetterCharset() {
      let lettersSet = '';
      if (readable) {
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
          numberSetPart.push(readable ? readableNumbers : numbersChars);
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

    let charset = '';
    if (letters) charset += getLetterCharset();
    if (numbers) charset += readable ? readableNumbers : numbersChars;
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

  getPasswordStrength(password: string): {
    str: string,
    color: string,
    score: number
  } {
    const hasLetters = /[a-zA-Z]/.test(password);

    const hasUpperCase = /[A-Z]/.test(password);
    const upperCaseMatches = password.match(/[A-Z]/g) || [];

    const hasNumbers = /[0-9]/.test(password);
    const numbersMatches = password.match(/[0-9]/g) || [];

    function escapeRegExp(str: string): string {
      return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }
    const specialReg = new RegExp(`[${escapeRegExp(this.specialChars)}]`, 'g');

    const hasSpecial = specialReg.test(password);
    const specialMatches = password.match(specialReg) || [];

    let score = 0;
    if (password.length >= 32) {
      score += 40;
    } else if (password.length >= 12) {
      score += 20;
    } else {
      score += 0;
    }

    if (hasLetters) score += 1;
    if (hasUpperCase) score += 2;
    if (hasNumbers) score += 2;
    if (hasSpecial) score += 10;

    score += upperCaseMatches.length
    + numbersMatches.length
    + specialMatches.length * 3

    if (score >= 100) {
      return { str: PasswordStrength.STRONG, color: this.progressBarColors[PasswordStrength.STRONG], score: score };
    } else if (score >= 80) {
      return { str: PasswordStrength.GOOD, color: this.progressBarColors[PasswordStrength.GOOD], score: score };
    } else if (score >= 50) {
      return { str: PasswordStrength.MEDIUM, color: this.progressBarColors[PasswordStrength.MEDIUM], score: score };
    } else {
      return { str: PasswordStrength.WEAK, color: this.progressBarColors[PasswordStrength.WEAK], score: score };
    }
  }

  setProgressPasswordStrengthValues(): void {
    const strength = this.getPasswordStrength(this.generatedPassword);
    this.progressBarValue = strength.score > 100 ? 100 : strength.score;
    this.progressBarColor = strength.color;
    this.passwordStrength = strength.str;
  }

  disableSubmit(): boolean {
    return this.generatedPassword.length < this.minLength;
  } 
}
