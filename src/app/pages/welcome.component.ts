import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatCardModule, RouterLink],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Welcome to the Education and AI Policy Commons</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <h1>Explore Our Comprehensive Resource</h1>
        <p>Welcome to the Education and AI Policy Commons, a platform designed for education researchers and policymakers. It draws on the <a href="https://oecd.ai/en/">OECD's AI Policy Observatory</a>, with a focus on AI and education. Here, you can gain a clear view of how governments are shaping the role of AI in education. With in-depth analysis of over 479 AI-related education policies, this platform offers valuable insights into key themes and policy trends. Discover how AI is being positioned to transform learning environments and drive educational innovation globally.

        We explore opportunities such as adaptive learning experiences, enhanced content delivery, and increased agency for learners.</p>
        <h2>About the Database</h2>
        <p>Our team conducted qualitative research on 473 policy documents, including all governance and regulation policies. We identified 83 policies relevant to the governance of AI in education, most of which commenced between 2019 and 2021. These policies primarily aim to educate officials, guide organizations, and plan future actions.</p>
        <p>For any questions about the status of our research, please contact us at: education.futures.studio&#64;gmail.com.</p>
        <h2>Key Links</h2>
        <p><a routerLink="/dashboards">Dashboards</a></p>
        <p><a routerLink="/data/policy-analysis">Policy analysis table</a></p>
        <p>Explore, contribute, and stay informed with the Education and AI Policy Commons.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class WelcomeComponent {
  private router = inject(Router);
}
