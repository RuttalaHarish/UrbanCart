import { Page, Section, Container } from '../components/common';
import Hero from '../components/home/Hero/Hero';
import Categories from '../components/home/Categories/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts/FeaturedProducts';

function Home() {
  return (
    <Page title="Home">
      <Section bgType="default">
        <Container>
          <Hero />
          <Categories />
          <FeaturedProducts />
        </Container>
      </Section>
    </Page>
  );
}

export default Home;
