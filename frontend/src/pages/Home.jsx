import { Page, Section, Container } from '../components/common';
import CategoryNav from '../components/CategoryNav';
import Hero from '../components/home/Hero/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts/FeaturedProducts';

function Home() {
  return (
    <Page title="Home">
      {/* Amazon/Flipkart Style Horizontal Category Bar */}
      <CategoryNav />

      <Section bgType="default">
        <Container>
          {/* Main UrbanCart Hero Section */}
          <Hero />
          {/* Featured Products Section */}
          <FeaturedProducts />
        </Container>
      </Section>
    </Page>
  );
}

export default Home;
