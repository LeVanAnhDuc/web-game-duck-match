declare namespace NodeJS {
  interface ProcessEnv {
    /** Site sub-path ("/web-game-duck-match"); empty or unset = site root. */
    readonly NEXT_PUBLIC_BASE_PATH?: string
    /** Ducker ID sign-in feature flag — only the string "true" enables it. */
    readonly NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN?: string
    readonly NEXT_PUBLIC_DUCKER_ISSUER?: string
    readonly NEXT_PUBLIC_DUCKER_CLIENT_ID?: string
    readonly NEXT_PUBLIC_DUCKER_SCOPE?: string
    readonly NEXT_PUBLIC_DUCKER_PROFILE_PATH?: string
  }
}
