'use client'
import React from 'react'
import './Footer.css'
import AnimatedLink from '../AnimatedLink'
import ShuffleText from '../ShuffleText/ShuffleText'

function Footer(): React.JSX.Element {
  return (
    <footer className="footer">
      <div className="footer-wrapper">
        <div className="footer-upper">
          <div className="cta">
            <div className="arrow-cont">
              <svg
                width="72"
                height="36"
                viewBox="0 0 72 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M51.3331 34.6223C51.3331 32.7954 52.2644 30.9789 53.5831 29.3038C54.9153 27.6114 56.733 25.9492 58.711 24.412C61.3701 22.3456 64.3782 20.4589 67.0225 18.978H1.00006C0.447776 18.978 6.10352e-05 18.5402 6.10352e-05 18.0002C6.10352e-05 17.4602 0.447776 17.0224 1.00006 17.0224H66.5499C64.4937 15.9388 62.2101 14.5436 60.0381 12.8764C56.2632 9.97866 52.7015 6.16808 51.3721 1.64829C51.2196 1.12944 51.5261 0.587852 52.0567 0.438484C52.5874 0.289247 53.1413 0.588927 53.294 1.10784C54.4535 5.05021 57.6337 8.54411 61.2735 11.3382C64.8965 14.1192 68.8549 16.1142 71.3692 17.0912C71.736 17.2337 71.9827 17.5745 71.9991 17.9601C72.0153 18.3454 71.7985 18.7041 71.4454 18.8758C68.378 20.3656 63.7745 22.9755 59.9551 25.9436C58.0445 27.4285 56.3625 28.9778 55.1671 30.4964C53.958 32.0323 53.3331 33.4271 53.3331 34.6223C53.3331 35.1623 52.8854 35.6001 52.3331 35.6001C51.7809 35.5999 51.3331 35.1622 51.3331 34.6223Z"
                  fill="#D9FE62"
                />
              </svg>
            </div>
            <div className="cta-text">
              <h2>Let’s Connect.</h2>
              <ShuffleText
                as="p"
                text="Let’s build for the next billion. Connect with me for work or
                  socials, and let’s co-create solutions that make digital life
                  safer, simpler, and better for people today and the
                  generations coming after us across Africa and beyond."
                triggerOnScroll={true}
              />
            </div>
          </div>
          <div className="socials">
            <h4>Socials</h4>
            <div className="link-menu">
              <AnimatedLink
                lastColor="#ffffff"
                textColor="#ffffff"
                strokeColor="#ffffff"
                href="https://www.facebook.com/share/15mHvRNdcV/?mibextid=wwXIfr "
                text="Facebook"
              />
              <AnimatedLink
                lastColor="#ffffff"
                textColor="#ffffff"
                strokeColor="#ffffff"
                href="#"
                text="Instagram"
              />
              <AnimatedLink
                lastColor="#ffffff"
                textColor="#ffffff"
                strokeColor="#ffffff"
                href="https://www.linkedin.com/company/metnov "
                text="LinkedIn"
              />
              <AnimatedLink
                lastColor="#ffffff"
                textColor="#ffffff"
                strokeColor="#ffffff"
                href="#"
                text="Tiktok"
              />
              <AnimatedLink
                lastColor="#ffffff"
                textColor="#ffffff"
                strokeColor="#ffffff"
                href="#"
                text="X"
              />
            </div>
          </div>
        </div>
        <div className="footer-lower">
          <div className="logo-footer">
            <svg
              width="1512"
              height="292"
              viewBox="0 0 1512 292"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="footer-logo"
            >
              <g>
                <path
                  d="M513.379 189.813L593.888 288.216H516.015L458.913 214.803H389.806V231.082H411.053V288.216H303.486V231.082H325.177V67.1815H303.486V10.0469H411.053V67.1815H389.806V164.091H461.581L516.015 96.7185H593.888L513.379 189.813Z"
                  fill="#ffffff"
                  className="k"
                />
                <path
                  d="M672.363 176.936L730.577 170.513C730.577 150.451 719.239 142.503 697.294 142.503C673.856 142.503 660.613 152.327 659.882 169.369H599.033C600.176 119.038 642.51 92.9351 695.039 92.9351C747.568 92.9351 795.587 116.781 795.587 172.04V231.082H823.186V288.216H779.327C760.811 288.216 749.855 277.629 749.855 259.061V257.153L760.049 234.071H744.17C736.992 265.102 718.826 291.968 665.154 291.968C604.654 291.968 594.459 255.627 594.459 235.946C594.459 202.626 613.737 182.977 672.332 176.904L672.363 176.936ZM681.828 240.525C708.664 240.525 730.609 226.154 730.609 203.071L684.495 209.875C667.473 212.514 658.04 214.422 658.04 225.009C658.04 237.504 669.378 240.525 681.859 240.525H681.828Z"
                  fill="#ffffff"
                  className="small-a"
                />
                <path
                  d="M847.036 96.7186H911.665V118.275L899.565 154.235H915.445C923.003 120.183 946.441 92.9351 987.283 92.9351C1036.79 92.9351 1067.44 125.874 1067.44 186.411V288.216H1002.43V196.998C1002.43 162.565 992.968 150.07 964.258 150.07C932.88 150.07 911.697 164.822 911.697 218.936V288.185H847.068V96.7186H847.036Z"
                  fill="#ffffff"
                  className="first-n"
                />
                <path
                  d="M1096.53 96.7186H1161.16V118.275L1149.06 154.235H1164.94C1172.5 120.183 1195.94 92.9351 1236.78 92.9351C1286.29 92.9351 1316.94 125.874 1316.94 186.411V288.216H1251.93V196.998C1251.93 162.565 1242.46 150.07 1213.75 150.07C1182.38 150.07 1161.19 164.822 1161.19 218.936V288.185H1096.56V96.7186H1096.53Z"
                  fill="#ffffff"
                  className="second-n"
                />
                <path
                  d="M1344.54 231.082H1398.21V153.885H1351.33V96.7504H1425.04C1445.85 96.7504 1457.95 107.338 1457.95 128.545V231.114H1512V288.248H1344.54V231.114V231.082ZM1456.61 47.5009C1456.61 65.4647 1442.07 80.0583 1424.09 80.0583C1406.12 80.0583 1391.57 65.4965 1391.57 47.5009C1391.57 29.5052 1406.12 14.9434 1424.09 14.9434C1442.07 14.9434 1456.61 29.5052 1456.61 47.5009Z"
                  fill="#ffffff"
                  className="i"
                />
                <path
                  d="M285.162 247.806L169.211 15.1977C164.637 6.00915 156.253 0.985627 147.488 0V114.81C153.427 115.764 158.984 119.324 162.097 125.556L175.213 151.85C186.424 174.329 169.973 200.591 144.884 200.527C144.693 200.527 144.471 200.527 144.28 200.527C144.058 200.527 143.836 200.527 143.581 200.527C118.46 200.591 102.041 174.297 113.284 151.818L126.432 125.524C129.481 119.42 134.911 115.891 140.691 114.873V0.0317944C132.117 1.1446 123.986 6.16812 119.477 15.1659L3.04921 247.838C-6.70071 267.296 8.38467 288.216 27.7257 288.216C31.1239 288.216 34.6809 287.581 38.2061 286.15L84.2245 267.773C103.502 260.078 123.891 256.231 144.28 256.231C164.669 256.231 185.185 260.11 204.526 267.868L249.941 286.086C253.498 287.517 257.055 288.185 260.485 288.185C279.795 288.185 294.88 267.296 285.162 247.838V247.806Z"
                  fill="#ffffff"
                  className="cap-a"
                />
              </g>
              <defs>
                <clipPath id="clip0_209_3526">
                  <rect width="1512" height="292" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="copyright">
            <p className="copy-text">Copyright © 2025 Yusuff Ridwan.</p>
            <p className="copy-text">Made with ❤️ from NG</p>
            <p className="copy-text">All rights reserved.</p>
          </div>
        </div>
        <div className="hero-img-overlay"></div>
      </div>
    </footer>
  )
}

export default Footer
