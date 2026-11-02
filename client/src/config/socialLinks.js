import {
  FiFacebook,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";

// Footer ke social media links. Sirf yahin badlein.
// IMPORTANT: neeche ke url abhi sirf platform ke aam home page hain (placeholder).
// Apni company ki asli profile ka link lagayein, jaise "https://www.facebook.com/aap-ka-page".
// Jis platform ka account na ho, us ki poori line delete kar dein, footer mein wo icon nahi dikhega.
const SOCIAL_LINKS = [
  { name: "Facebook", icon: FiFacebook, url: "https://www.facebook.com/" },
  { name: "Instagram", icon: FiInstagram, url: "https://www.instagram.com/" },
  { name: "X (Twitter)", icon: FiTwitter, url: "https://x.com/" },
  { name: "LinkedIn", icon: FiLinkedin, url: "https://www.linkedin.com/" },
  { name: "YouTube", icon: FiYoutube, url: "https://youtu.be/3LRZRSIh_KE?si=e3fsZAFrVWariwwt" },
  { name: "GitHub", icon: FiGithub, url: "https://github.com/yousufafridi3265-lgtm?tab=repositories" },
];

export default SOCIAL_LINKS;
