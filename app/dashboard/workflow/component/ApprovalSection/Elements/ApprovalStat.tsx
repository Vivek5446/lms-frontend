import React from 'react'
import StatCard from './StatCard'
import { Grid } from '@chakra-ui/react'

const ApprovalStat = ({config}:any) => {
  return (
     <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
        <StatCard 
          label="Editable Levels" 
          value={config.editableMode?.length || 0} 
          total={config.noOfLevels}
          color="green"
        />
        <StatCard 
          label="Bulk Approve" 
          value={config.bulkApprovalLevels?.length || 0} 
          total={config.noOfLevels}
          color="blue"
        />
        <StatCard 
          label="Bulk Reject" 
          value={config.bulkRejectLevels?.length || 0} 
          total={config.noOfLevels}
          color="red"
        />
        <StatCard 
          label="Additional Docs" 
          value={config.additionalDocumentLevels?.length || 0} 
          total={config.noOfLevels}
          color="purple"
        />
      </Grid>
  )
}

export default ApprovalStat