import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private aiPrinciplesSignal = signal([
    { principle: "Accountability", count: 9, description: "It should always be clear who is accountable for the use of AI in educational settings" },
    { principle: "Privacy and data protection", count: 13, description: "AI systems used in educational settings should not create privacy or data security vulnerabilities" },
    { principle: "Transparency (explainability)", count: 10, description: "AI systems used in education should be sufficiently explainable" },
    { principle: "Teacher training", count: 18, description: "Teachers should be trained to ensure that AI is used well in educational settings" },
    { principle: "Equity/equality (increasing)", count: 12, description: "This technology should be used as a means of reducing existing educational inequities" },
    { principle: "Harm avoidance", count: 10, description: "AI systems used in schools should not harm the wellbeing or safety of any member" },
    { principle: "Academic integrity", count: 3, description: "Students should be supported to use AI tools ethically in their work" },
    { principle: "Human rights-centred", count: 10, description: "The technology must be consistent with human rights" },
    { principle: "Augmentation, not replacement", count: 7, description: "AI systems should not be used in educational settings as a replacement for teachers" },
    { principle: "Managing bias", count: 10, description: "The risk of bias should be managed with care" }
  ]);

  readonly aiPrinciples = this.aiPrinciplesSignal.asReadonly();
}
