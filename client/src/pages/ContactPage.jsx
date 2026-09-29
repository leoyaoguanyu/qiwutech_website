import usePageMeta from '../hooks/usePageMeta.js';
import PageHero from '../components/ui/PageHero.jsx';
import ContactInfo from '../components/contact/ContactInfo.jsx';
import ContactForm from '../components/contact/ContactForm.jsx';
import { contactPage } from '../data/contact.js';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  usePageMeta({
    title: '联系我们',
    description: '联系启物科技，获取智能机器人解决方案的详细信息',
  });

  return (
    <>
      <PageHero title={contactPage.hero.title} subtitle={contactPage.hero.subtitle} />

      <section className={styles.contact}>
        <div className="container">
          <div className={styles.content}>
            <ContactInfo items={contactPage.info} />
            <ContactForm disclaimer={contactPage.disclaimer} />
          </div>
        </div>
      </section>
    </>
  );
}
