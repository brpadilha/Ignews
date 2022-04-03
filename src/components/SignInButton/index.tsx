import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.scss";
import { signIn,signOut, useSession } from "next-auth/react"

export function SignInButton() {

  const {data: session} = useSession( )
console.log(session)
  return session ? (
    <button type="button" className={styles.signInButton}
      onClick={()=>signOut()}
    >
      <FaGithub color="#84d361" />
      SignOut in with Github
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn("githin")}
    >
      <FaGithub color="#eba417" />
      Sign in with Github
    </button>
  );
}
