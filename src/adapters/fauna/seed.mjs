import faunadb from 'faunadb'
const q = faunadb.query
const isProduction = process.env.NODE_ENV === 'production'
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET ?? 'secret',
  scheme: isProduction ? 'https' : 'http',
  domain: isProduction ? 'db.fauna.com' : 'localhost',
  ...(isProduction ? {} : { port: 8443 }),
})

async function main() {
  const userId = '290674292629176832'
  // Get all the participants of a goal
  const response = await client.query(
    q.Let(
      {
        goalDoc: q.Create(q.Collection('goals'), {
          data: {
            createdBy: q.Ref(q.Collection('users'), userId),
            title: 'Contribute to Open Source',
            description: `My goal is to contribute to any open source atleast once in a
week. I would have achieved my goal if I complete all of the
following.

- Contribute to open source projects atleast once per week for 6 months.
- Get atleast 1 pull request merged atleast once per month for 6 months.
              `,
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
        goalParticipant: q.Create(q.Collection('goal_participants'), {
          data: {
            goal: q.Ref(
              q.Collection('goals'),
              q.Select(['ref', 'id'], q.Var('goalDoc'))
            ),
            participant: q.Ref(q.Collection('users'), userId),
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
        goalUpdate1: q.Create(q.Collection('goal_updates'), {
          data: {
            goal: q.Ref(
              q.Collection('goals'),
              q.Select(['ref', 'id'], q.Var('goalDoc'))
            ),
            postedBy: q.Ref(q.Collection('users'), userId),
            description: `Opened an issue in [Coderplex](https://github.com/coderplex-org/coderplex-org) repo.`,
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
        goalUpdate2: q.Create(q.Collection('goal_updates'), {
          data: {
            goal: q.Ref(
              q.Collection('goals'),
              q.Select(['ref', 'id'], q.Var('goalDoc'))
            ),
            postedBy: q.Ref(q.Collection('users'), userId),
            description: `Submitted a PR to [Coderplex](https://github.com/coderplex-org/coderplex-org) repo. Waiting for the review.`,
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
      },
      {
        goal: q.Var('goalDoc'),
      }
    )
  )

  // const userId = '289600688475865602'
  const updateId = '290684409014649344'
  const response2 = await client.query(
    q.Let(
      {
        parentCommentDoc: q.Create(q.Collection('update_comments'), {
          data: {
            update: q.Ref(q.Collection('goal_updates'), updateId),
            postedBy: q.Ref(q.Collection('users'), userId),
            parentComment: null,
            description: 'This is the first ever parent comment!!',
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
        childComment1Doc: q.Create(q.Collection('update_comments'), {
          data: {
            update: q.Ref(q.Collection('goal_updates'), updateId),
            postedBy: q.Ref(q.Collection('users'), userId),
            parentComment: q.Select(['ref'], q.Var('parentCommentDoc')),
            description: 'This is the first ever child comment!!',
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
        childComment2Doc: q.Create(q.Collection('update_comments'), {
          data: {
            update: q.Ref(q.Collection('goal_updates'), updateId),
            postedBy: q.Ref(q.Collection('users'), userId),
            parentComment: q.Select(['ref'], q.Var('parentCommentDoc')),
            description: 'This is the second ever child comment!!',
            timestamps: {
              createdAt: q.Now(),
              updatedAt: q.Now(),
            },
          },
        }),
      },
      {
        parentCommentId: q.Select(['ref', 'id'], q.Var('parentCommentDoc')),
        childComment1Id: q.Select(['ref', 'id'], q.Var('childComment1Doc')),
        childComment2Id: q.Select(['ref', 'id'], q.Var('childComment2Doc')),
      }
    )
  )
  console.log({
    response: JSON.stringify(response),
    response2: JSON.stringify(response2),
  })
}

main().catch((e) => console.error(e))
