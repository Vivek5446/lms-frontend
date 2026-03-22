'use client'
import React from 'react'
import LineItems from '../labs/component/LineItems/LineItems'
import stores from '../../store/stores'

const page = () => {
  const {auth : {user}} = stores

  return (
    <LineItems data={{patientData : {_id : user?._id}, isPatient : true} } />
  )
}

export default page