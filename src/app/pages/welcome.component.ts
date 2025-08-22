import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Welcome to the Education and AI Policy Commons</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <h1>Explore Our Comprehensive Resource</h1>
        <p>Welcome to the Education and AI Policy Commons, a platform designed for education researchers and policymakers. It draws on the <a href="https://oecd.ai/en/">OECD’s AI Policy Observatory</a>, with a focus on AI and education. Here, you can gain a clear view of how governments are shaping the role of AI in education. With in-depth analysis of over 479 AI-related education policies, this platform offers valuable insights into key themes and policy trends. Discover how AI is being positioned to transform learning environments and drive educational innovation globally. This platform also enables you to participate in building knowledge about the emerging landscape of policies impacting AI, from schools to governments.</p>
        <p>Key Features:</p>
        <ul>
          <li>Policy Search: Access a vast database of national and international AI in education policies.</li>
          <li>Data Dashboards: View qualitative analysis completed by our expert team.</li>
          <li>Policy Upload: Contribute by uploading policies that may interest others.</li>
        </ul>
        <h1>How you could use this site</h1>
        <p>If you are a(an)...</p>
        <ul>
          <li>Policy Maker: Conduct quick scans of recent AI policies in education.</li>
          <li>Researcher: Explore the balance between risk and opportunity in AI and education policies.</li>
          <li>Human Rights Advocate: Investigate how different countries address AI and human rights.</li>
          <li>Equity and Inclusion Enthusiast: Identify policies that address equity and inclusion in AI and education.</li>
          <li>Educator: Understand the practical implications of AI policies in classrooms.</li>
          <li>Curriculum Developer: Find examples of how AI policies influence teaching strategies and learning outcomes.</li>
          <li>Public Policy Student: Study global trends and government approaches to AI in education.</li>
          <li>Technology Developer: Learn how policy frameworks impact AI innovations for educational tools.</li>
          <li>Non-Profit Organisation: Discover policies prioritizing access to AI resources in under-resourced communities.</li>
          <li>Data Privacy Expert: Explore how different countries manage student data in the context of AI.</li>
          <li>Journalist: Gain insights into how nations handle ethical challenges in AI for education.</li>
          <li>EdTech Investor: Identify supportive policy environments for AI-driven educational technologies.</li>
          <li>International Relations Professional: Compare how nations use AI in education as part of their strategic development goals.</li>
        </ul>
        <p><a href="http://localhost:4200/tips">Tips for Effective Use</a></p>
        <h2>About the Research</h2>
        <p>Our research focuses on the potential of AI to progress equity and inclusion in education. We explore opportunities such as adaptive learning experiences, enhanced content delivery, and increased agency for learners.</p>
        <h2>About the Database</h2>
        <p>Our team conducted qualitative research on 473 policy documents, including all governance and regulation policies. We identified 83 policies relevant to the governance of AI in education, most of which commenced between 2019 and 2021. These policies primarily aim to educate officials, guide organizations, and plan future actions.</p>
        <p>For any questions about the status of our research, please contact us at: education.futures.studio&#64;gmail.com.</p>
        <h2>Key Links</h2>
        <p><a href="http://localhost:4200/dashboards">Dashboards</a></p>
        <p><a href="http://localhost:4200/data/policy-analysis">Policy analysis table</a></p>
        <p>Explore, contribute, and stay informed with the Education and AI Policy Commons.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class WelcomeComponent {
}
