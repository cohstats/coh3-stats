import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';
import { NewsSection } from '../components/NewsSection/NewsSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <NewsSection />
      <NewsSection />
      <NewsSection />
      <Footer />
    </>
  );
}
