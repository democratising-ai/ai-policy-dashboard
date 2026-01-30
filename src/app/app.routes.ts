import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome.component';
import { TipsComponent } from './pages/tips.component';
import { DashboardsComponent } from './pages/dashboards/dashboards';
import { DataComponent } from './pages/data/data';
import { AIPrinciplesComponent } from './pages/ai-principles.component';
import { AllPoliciesComponent } from './pages/dashboards/all-policies/all-policies';
import { RelevantPoliciesComponent } from './pages/dashboards/relevant-policies/relevant-policies';
import { CreationYearComponent } from './pages/dashboards/creation-year/creation-year';
import { GovernancePracticesComponent } from './pages/dashboards/governance-practices/governance-practices';
import { OpportunityRiskComponent } from './pages/dashboards/opportunity-risk/opportunity-risk';
import { PrinciplesComponent } from './pages/dashboards/principles/principles';
import { EssentialReadingComponent } from './pages/dashboards/essential-reading/essential-reading';
import { RelevanceAssessmentComponent } from './pages/data/relevance-assessment/relevance-assessment';
import { LookupTablesComponent } from './pages/data/lookup-tables/lookup-tables';
import { PolicyAnalysisComponent } from './pages/data/policy-analysis/policy-analysis';
import { TableAComponent } from './pages/data/all-potentially-relevant-ai-policies-reviewed/all-potentially-relevant-ai-policies-reviewed';
import { PolicyFormComponent } from './pages/data/policy-form/policy-form';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'tips', component: TipsComponent },
  {
    path: 'dashboards',
    component: DashboardsComponent,
    children: [
      { path: 'all-policies', component: AllPoliciesComponent },
      { path: 'relevant-policies', component: RelevantPoliciesComponent },
      { path: 'creation-year', component: CreationYearComponent },
      { path: 'governance-practices', component: GovernancePracticesComponent },
      { path: 'opportunity-risk', component: OpportunityRiskComponent },
      { path: 'principles', component: PrinciplesComponent },
      { path: 'essential-reading', component: EssentialReadingComponent },
      { path: '', redirectTo: 'all-policies', pathMatch: 'full' }
    ]
  },
  {
    path: 'data',
    component: DataComponent,
    children: [
      { path: 'relevance-assessment', component: RelevanceAssessmentComponent },
      { path: 'lookup-tables', component: LookupTablesComponent },
      { path: 'all-potentially-relevant-ai-policies-reviewed', component: TableAComponent },
      { path: 'policy-analysis', component: PolicyAnalysisComponent },
      { path: 'policy-form/:table', component: PolicyFormComponent, canActivate: [authGuard] },
      { path: '', redirectTo: 'relevance-assessment', pathMatch: 'full' }
    ]
  },
  { path: 'ai-principles', component: AIPrinciplesComponent },
  { path: '**', redirectTo: '' }
];
