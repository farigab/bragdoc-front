// src/app/pipes/markdown.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string): SafeHtml {
    if (!value) return '';

    // Configura o marked para evitar problemas de segurança
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    const html = marked.parse(value);
    return this.sanitizer.sanitize(1, html) || '';
  }
}
