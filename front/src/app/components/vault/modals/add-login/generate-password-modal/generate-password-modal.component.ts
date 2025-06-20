import { Component } from '@angular/core';


  enum PasswordStyle {
    Readable = 'readable',
    NotReadable = 'not-readable'
  }

  enum PasswordCase {
    None = 'none',
    All = 'all',
    Mixed = 'mixed'
  }

  interface PasswordOptions {
    length?: number;
    style?: PasswordStyle;
    letters?: boolean;
    numbers?: boolean;
    specialChar?: boolean;
    useWords?: boolean;
    uppercase?: PasswordCase;
  }

@Component({
  selector: 'app-generate-password-modal',
  imports: [],
  templateUrl: './generate-password-modal.component.html',
  styleUrl: './generate-password-modal.component.css'
})
export class GeneratePasswordModalComponent {

  private minLength = 32;

  constructor() {
    console.log('GeneratePasswordModalComponent initialized');
  }
  
  generatePassword(options: PasswordOptions = {
    length: this.minLength,
    style: PasswordStyle.NotReadable,
    letters: true,
    numbers: true,
    specialChar: true,
    useWords: false,
    uppercase: PasswordCase.Mixed
  }): string {
    // Base sets
    const length = options.length || this.minLength;
    const style = options.style || PasswordStyle.NotReadable;
    const letters = options.letters !== undefined ? options.letters : true;
    const numbers = options.numbers !== undefined ? options.numbers : true;
    const specialChar = options.specialChar !== undefined ? options.specialChar : true;
    const useWords = options.useWords !== undefined ? options.useWords : false;
    const uppercase = options.uppercase || PasswordCase.Mixed;

    const lowerLetters = 'abcdefghijklmnopqrstuvwxyz';
    const upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const readableLower = 'abcdefghjkmnpqrstuvwxyz';  // sans i, l, o
    const readableUpper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const numbersChars = '0123456789';
    const readableNumbers = '23456789'; // sans 0,1
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    // Liste de mots simples (exemple réduit, tu peux remplacer par ta liste)
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
      'key', 'log', 'map', 'toy', 'car', 'bus', 'van', 'jet', 'cab', 'taxi', 'bike', 'boat'
    ];

    // Génère un charset lettres selon options style et uppercase
    function getLetterCharset() {
      let lettersSet = '';
      if (style === 'readable') {
        if (uppercase === 'none') lettersSet = readableLower;
        else if (uppercase === 'all') lettersSet = readableUpper;
        else lettersSet = readableLower + readableUpper;
      } else {
        if (uppercase === 'none') lettersSet = lowerLetters;
        else if (uppercase === 'all') lettersSet = upperLetters;
        else lettersSet = lowerLetters + upperLetters;
      }
      return lettersSet;
    }

    if (!letters && !numbers && !specialChar && !useWords) {
      throw new Error('At least one character type or useWords must be selected.');
    }

    if (useWords) {
      let password = '';
      while (password.length < length) {
        // choisir un mot
        let word = simpleWords[Math.floor(Math.random() * simpleWords.length)];
        // appliquer uppercase si nécessaire
        if (uppercase === 'all') word = word.toUpperCase();
        else if (uppercase === 'mixed') {
          // mélanger minuscules et majuscules aléatoirement
          word = word
            .split('')
            .map(c => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
            .join('');
        } else {
          word = word.toLowerCase();
        }

        // ajouter éventuellement des caractères
        let insertChars = '';
        if (password.length + word.length < length) {
          const charsLeft = length - (password.length + word.length);
          const charsToAdd = Math.min(charsLeft, 2);

          const charsetParts = [];
          if (letters) charsetParts.push(getLetterCharset());
          if (numbers) charsetParts.push(style === 'readable' ? readableNumbers : numbersChars);
          if (specialChar) charsetParts.push(specialChars);

          const charset = charsetParts.join('');
          for (let i = 0; i < charsToAdd; i++) {
            insertChars += charset.charAt(Math.floor(Math.random() * charset.length));
          }
        }

        password += word + insertChars;
      }
      return password.substring(0, length);
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
