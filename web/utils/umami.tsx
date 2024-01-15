import Script from 'next/script'
import { useEffect } from 'react'

/* global umami, VERSION */
const Umami = () => {
  const appVersion = VERSION

  useEffect(() => {
    // Check if umami is defined before calling track
    if (typeof umami !== 'undefined') {
      umami.track(appVersion, {
        version: appVersion,
      })
    }
  }, [appVersion])

  return (
    <>
      <Script
        src="https://us.umami.is/script.js"
        data-website-id="0d6d8b40-a7e8-4f1c-9d81-a28cfcbc28f4"
        data-cache="true"
        defer
        onLoad={() => document.dispatchEvent(new Event('umami:loaded'))}
      />
    </>
  )
}

export default Umami
