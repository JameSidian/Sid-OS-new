/**
 * RFP Proposal Workflow Composable
 * Handles the complete RFP proposal workflow: finding RFP, analyzing, finding examples, and writing proposal
 */

export interface RFPProposalState {
  step: 'initial' | 'rfp_found' | 'rfp_opened' | 'keypoints_shared' | 'examples_added' | 'template_added' | 'proposal_written'
  rfpPath?: string
  rfpFileName?: string
  projectFolder?: string
  keypoints?: string
}

export interface Document {
  id: string
  title: string
  name?: string
  filePath?: string
  url?: string
  description?: string
  metadata?: Record<string, string | number | undefined>
  reason?: string
}

/**
 * Extract project folder from user message
 * Examples: "new RFP in project 2025-12-001", "RFP in 2025-12-001"
 */
export function extractProjectFolder(message: string): string | null {
  const projectPattern = /\b(?:project\s+)?(\d{4}-\d{2}-\d{3})\b/i
  const match = message.match(projectPattern)
  return match ? match[1] : null
}

/**
 * Search for RFP files in a project folder
 * In production, this would call the backend to search for files
 * For now, we'll use the hardcoded path
 */
export async function searchRFPInFolder(projectFolder: string): Promise<{ path: string; fileName: string } | null> {
  // Simulate async search
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // For demo, always return the known RFP
  // In production, this would search the actual folder
  if (projectFolder === '2025-12-001' || true) {
    return {
      path: '/writing/Structural Engineer RFP 63023.pdf',
      fileName: 'Structural Engineer RFP 63023.pdf'
    }
  }
  
  return null
}

/**
 * Read keypoints from file
 * In production, this would call the backend to read the file
 */
export async function readKeypoints(): Promise<string> {
  // For demo, return the hardcoded keypoints
  // In production, this would read from the file
  return `Key Structural Components & Considerations for the Cooper Master Campus Plan RFP

The Cooper Master Campus Plan represents a highly complex, multi-phase healthcare development in an active urban environment. From a structural engineering standpoint, several critical components require early, deliberate consideration to reduce risk and preserve long-term flexibility.

First, deep foundations and below-grade construction are a primary driver of structural complexity. Tower A, and future Towers B and C, include basements extending below the anticipated groundwater table, requiring careful coordination with geotechnical engineering to address hydrostatic uplift, waterproofing, shoring, and underpinning of adjacent existing facilities. Structural solutions must minimize settlement and vibration impacts to the operational hospital campus.

Second, integration with existing structures is a major consideration. Tower A must physically connect to the Kelemen and Roberts Pavilion buildings and support a multi-story pedestrian bridge over Haddon Avenue. Structural design must account for differential movement, seismic and wind compatibility, phased construction tolerances, and the modification or strengthening of existing structural systems.

Third, lateral system selection and future expandability are essential. Tower A establishes structural precedents for the campus and must be designed with an understanding of future Towers B and C, shared podiums, and potential vertical or lateral expansion. Early decisions regarding column grids, shear walls, cores, and transfer systems will significantly influence future constructability and cost.

Fourth, structural support of major MEP and energy infrastructure is critical. The RFP anticipates geothermal wells beneath Tower A, rooftop mechanical screening structures, and potential vertical expansion of the existing Boiler House—none of which were originally designed for additional load. Structural engineers must coordinate closely with MEP to ensure load paths, vibration control, and constructability are fully resolved.

Finally, phasing, early bid packages, and constructability are central to meeting the aggressive schedule. Early foundation and steel packages, coordination with target value design (TVD), and constructability reviews during design are required to enable construction to proceed while maintaining uninterrupted healthcare operations.`
}

/**
 * Get example report document
 */
export function getExampleReport(): Document {
  return {
    id: 'example-report-1',
    title: 'Multi-level parking Garage.docx',
    name: 'Multi-level parking Garage',
    filePath: '/writing/Multi-level parking Garage.docx',
    url: '/writing/Multi-level parking Garage.docx',
    description: 'Example report from a similar past project',
    reason: 'Similar structural engineering scope and complexity'
  }
}

/**
 * Get proposal template document
 */
export function getProposalTemplate(): Document {
  return {
    id: 'proposal-template-1',
    title: 'RFPTemplate.pdf',
    name: 'RFP Template',
    filePath: '/writing/RFPTemplate.pdf',
    url: '/writing/RFPTemplate.pdf',
    description: 'Company standard proposal template',
    reason: 'Standard format and structure for proposals'
  }
}

/**
 * Read proposal content from CooperProposals.pdf
 * In production, this would extract text from the PDF via backend
 */
export async function readProposalContent(): Promise<string> {
  // For demo, return a sample proposal structure
  // In production, this would extract text from CooperProposals.pdf
  return `<h1>Proposal: Structural Engineering Services</h1>

<h2>Executive Summary</h2>
<p>This proposal outlines our approach to providing structural engineering services for the Cooper Master Campus Plan project. Our team brings extensive experience in healthcare facility design and complex urban construction projects.</p>

<h2>Project Understanding</h2>
<p>We have thoroughly reviewed the RFP and understand the complexity of this multi-phase healthcare development. Key considerations include:</p>
<ul>
<li>Deep foundations and below-grade construction below the groundwater table</li>
<li>Integration with existing structures including the Kelemen and Roberts Pavilion buildings</li>
<li>Multi-story pedestrian bridge over Haddon Avenue</li>
<li>Future expandability for Towers B and C</li>
<li>Structural support for major MEP and energy infrastructure</li>
</ul>

<h2>Our Approach</h2>
<p>Our structural engineering team will work closely with the design team to develop solutions that address all RFP requirements while maintaining constructability and cost-effectiveness.</p>

<h2>Key Structural Components</h2>
<p>Based on our analysis of similar projects and the specific requirements of this RFP, we will focus on:</p>
<ul>
<li>Foundation design and geotechnical coordination</li>
<li>Lateral system design with future expandability in mind</li>
<li>Integration with existing structures</li>
<li>MEP coordination and load path resolution</li>
<li>Phased construction and constructability reviews</li>
</ul>

<h2>Timeline and Deliverables</h2>
<p>We propose to deliver all required structural engineering services according to the project schedule, with early foundation and steel packages to support the aggressive construction timeline.</p>

<h2>Team and Experience</h2>
<p>Our team has extensive experience with similar healthcare facility projects and complex urban construction. We understand the challenges of working in an active healthcare environment and the importance of minimizing disruption.</p>`
}

export const useRFPProposalWorkflow = () => {
  return {
    extractProjectFolder,
    searchRFPInFolder,
    readKeypoints,
    getExampleReport,
    getProposalTemplate,
    readProposalContent
  }
}

