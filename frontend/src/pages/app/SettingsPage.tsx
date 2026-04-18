import { motion } from 'framer-motion'
import ProfileForm      from '../../components/settings/ProfileForm'
import PasswordForm     from '../../components/settings/PasswordForm'
import GmailIntegration from '../../components/settings/GmailIntegration'

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08 },
  }),
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <ProfileForm />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
        <PasswordForm />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
        <GmailIntegration />
      </motion.div>

    </div>
  )
}