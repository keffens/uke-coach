import { Columns, Container, Content, Title } from "bloomer";
import Layout from "../components/Layout";
import LinkBox from "../components/LinkBox";

export default function Home() {
  return (
    <Layout title="Ukulele Coach">
      <Container>
        <Content hasTextAlign="centered">
          <Title isSize={1} hasTextColor="primary">
            Ukulele Coach
          </Title>
        </Content>

        <Columns className="mt-4">
          <LinkBox href="https://nextjs.org/docs">
            <h3>Documentation</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </LinkBox>

          <LinkBox href="https://nextjs.org/learn">
            <h3>Learn</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </LinkBox>
        </Columns>

        <Columns>
          <LinkBox href="https://github.com/vercel/next.js/tree/master/examples">
            <h3>Examples</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </LinkBox>

          <LinkBox href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app">
            <h3>Deploy</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </LinkBox>
        </Columns>

        <Columns>
          <LinkBox href="https://bulma.io/documentation/">
            <h3>Bulma</h3>
            <p>The modern CSS framework that just works.</p>
          </LinkBox>

          <LinkBox href="https://bloomer.js.org/#/documentation/overview/start">
            <h3>Bloomer</h3>
            <p>A set of React components for Bulma.</p>
          </LinkBox>
        </Columns>
      </Container>
    </Layout>
  );
}
