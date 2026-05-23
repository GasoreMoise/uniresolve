export interface ProcedureDetail {
    steps: string[];
    sla: string;
    requirements: string[];
    notice: string;
  }
  
  export const proceduresRegistry: Record<string, ProcedureDetail> = {
    'Special Quiz': {
      steps: [
        'Submit the absentia claim digital form within 48 hours of the missed assessment[cite: 266].',
        'The case is instantly pushed to your specific Head of Department (HoD) and course lecturer dashboard[cite: 268].',
        'The board reviews your uploaded medical/institutional justification logs for approval[cite: 267].',
        'Once approved, the system logs the decision and triggers an in-app notice with the rescheduled quiz date[cite: 269].'
      ],
      sla: '3 - 5 Working Days',
      requirements: [
        'Official signed medical certificate or recognized emergency leave documentation[cite: 267].',
        'Missed Module Code and assigned Lecturer name.'
      ],
      notice: 'Unfair structural rejections can be escalated automatically to the Faculty Dean table for secondary administrative review[cite: 264, 268].'
    },
    'Special CAT': {
      steps: [
        'Lodge the Special Continuous Assessment Test request online[cite: 266].',
        'The application routes straight to the Faculty Registrar and Departmental HoD[cite: 268].',
        'The department checks your historical module registration state for compliance check variables.',
        'Approved status unlocks your authorization pass to sit for the rescheduled major evaluation session.'
      ],
      sla: '3 - 5 Working Days',
      requirements: [
        'Authentic proof of absence justification (Medical note, official representation letter)[cite: 267].',
        'Complete list of affected modules and credit structures.'
      ],
      notice: 'Late claims submitted after the departmental exam board has compiled final returns will be automatically rejected.'
    },
    'Card Replacement': {
      steps: [
        'Initiate the card loss replacement token request on this panel[cite: 252].',
        'The system executes an automated real-time background query checking your active student registration status[cite: 254].',
        'Upon identity verification, the job orders skip financial queues and drop directly to Campus Operations for active card printing.',
        'Receive a system status notification update when your card is printed and ready at the service desk[cite: 255].'
      ],
      sla: '24 - 48 Hours',
      requirements: [
        'Valid student registration number and clear passport photograph upload.',
        'Digital upload of a certified lost property report if available.'
      ],
      notice: 'This service is entirely free of charge. Multiple physical trips between the Registrar and Bank have been fully eliminated[cite: 248, 257].'
    },
    'CAT Claims': {
      steps: [
        'Submit your coursework or missing mark claim directly via your dashboard portal[cite: 280].',
        'Provide your specific assignment/test submission group details and expected parameters.',
        'The claim routes to the lecturer and HoD workspace queues for script reconciliation[cite: 282].',
        'The corrected marks are safely committed to the database and updated transparently on your profile[cite: 283].'
      ],
      sla: '5 - 7 Working Days',
      requirements: [
        'Copy of the signed assessment attendance list or coursework presentation receipt if available[cite: 281].',
        'Continuous Assessment component breakdown sheet.'
      ],
      notice: 'All grade adjustments maintain a secure logging history to prevent unauthorized record manipulation[cite: 287].'
    },
    'Registration Payment': {
      steps: [
        'Upload the digital scan or image snapshot of your processed bank deposit slip[cite: 239].',
        'Input the unique Bank Transaction Reference/Query ID from your printout.',
        'The Finance/Bursar office verifies the incoming funds against the university banking portal records[cite: 240, 241].',
        'Account status updates to Cleared, instantly lifting your course registration hold.'
      ],
      sla: '24 Hours',
      requirements: [
        'Clear, legible image or PDF upload of the physical bank deposit receipt[cite: 239].',
        'Correct Transaction Reference code matching bank ledgers.'
      ],
      notice: 'Reporting transaction issues instantly prevents automated penalties due to banking network latency bottlenecks[cite: 235, 238, 244].'
    }
  };
  
  // Fallback configuration profile for any services that do not have explicitly detailed custom procedural metadata paths yet
  export const defaultProcedure: ProcedureDetail = {
    steps: [
      'Submit your detailed issue request form securely via this centralized terminal[cite: 294].',
      'The system analyzes the issue category metadata and dispatches it to the corresponding administrative office queue[cite: 295].',
      'Staff process the records and transition statuses transparently across the ledger tracking lifecycle[cite: 296, 299].'
    ],
    sla: '2 - 4 Working Days',
    requirements: [
      'Clear breakdown statement detailing the exact nature of your claim or incident[cite: 280].',
      'Any relevant supporting attachments or documents[cite: 281].'
    ],
    notice: 'All data points are securely backed up in the institutional registry database to protect against information loss[cite: 296, 300].'
  };