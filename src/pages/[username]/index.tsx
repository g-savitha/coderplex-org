import { Title } from '@/components'
import { PaddedLayout } from 'src/layouts'

import faunadb from 'faunadb'
import { InferGetServerSidePropsType } from 'next'
import { User } from '../members'
const q = faunadb.query
const isProduction = process.env.NODE_ENV === 'production'
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET ?? 'secret',
  scheme: isProduction ? 'https' : 'http',
  domain: isProduction ? 'db.fauna.com' : 'localhost',
  ...(isProduction ? {} : { port: 8443 }),
})

export default function UserProfile({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Title>{user.username}</Title>
      <p>Hello World - User Profile</p>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const username = context.query.username
  const dbUser = q.Get(q.Match(q.Index('user_by_username'), username))
  const user = (await client.query({
    id: q.Select(['ref', 'id'], dbUser),
    name: q.Select(['data', 'name'], dbUser),
    username: q.Select(['data', 'username'], dbUser),
    email: q.Select(['data', 'email'], dbUser),
    image: q.Select(['data', 'image'], dbUser),
  })) as User
  return {
    props: {
      user,
    },
  }
}

UserProfile.layoutProps = {
  Layout: PaddedLayout,
}
