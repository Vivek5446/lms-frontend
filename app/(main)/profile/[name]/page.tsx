"use client"
import { Box, Spinner, Center, Text } from '@chakra-ui/react'
import ProfilePage from '../components/ProfilePage'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import stores from '../../../store/stores'
import { useParams } from 'next/navigation'

const Page = observer(() => {
  const { userStore: { getUserByName } } = stores
  const params = useParams()

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!params?.name) return

    setLoading(true)
    setError(false)  // Reset error before fetching

    getUserByName({ name: params.name })
      .then((data: any) => {
        if (!data?.data?.data) {
          setError(true)  // No data found, set error
        } else {
          setUserData(data.data?.data)
        }
      })
      .catch(() => {
        setError(true)  // API error also treated as "No Record Found"
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params?.name, getUserByName])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="red.500">
          No Record Found
        </Text>
      </Center>
    )
  }

  return (
    <Box>
      <ProfilePage userData={userData} />
    </Box>
  )
})

export default Page
