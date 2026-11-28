/**
 * Flat 2D editorial illustration of students walking together along a winding
 * pastoral path, echoing "Journey Together" and the warm flat-2D meadow palette.
 */
export function JourneyIllustration() {
  return (
    <div className="relative flex w-full max-w-[340px] items-center justify-center sm:max-w-[360px]">
      <svg
        viewBox="0 0 360 300"
        fill="none"
        role="img"
        aria-label="Flat 2D illustration of three students walking together along a winding green pathway"
        className="h-auto w-full select-none"
      >
        {/* Distant slender trees echoing the pastoral path reference */}
        <g aria-hidden="true">
          {/* Left distant tree */}
          <rect
            x="66"
            y="112"
            width="4.5"
            height="68"
            rx="2"
            className="fill-[#6b5642] dark:fill-[#544435]"
          />
          <ellipse
            cx="68"
            cy="98"
            rx="22"
            ry="28"
            className="fill-[#9ccc5a] dark:fill-[#3d5c24]"
          />
          <ellipse
            cx="77"
            cy="108"
            rx="14"
            ry="18"
            className="fill-[#82b844] dark:fill-[#314a1d]"
          />

          {/* Right distant pair of trees */}
          <rect
            x="284"
            y="102"
            width="5"
            height="76"
            rx="2"
            className="fill-[#6b5642] dark:fill-[#544435]"
          />
          <ellipse
            cx="286"
            cy="88"
            rx="24"
            ry="32"
            className="fill-[#8cc24b] dark:fill-[#365220]"
          />
          <rect
            x="308"
            y="128"
            width="4"
            height="54"
            rx="2"
            className="fill-[#75604b] dark:fill-[#5a4a3a]"
          />
          <ellipse
            cx="310"
            cy="118"
            rx="16"
            ry="20"
            className="fill-[#a9d868] dark:fill-[#46682a]"
          />
        </g>

        {/* Soft rolling meadow hills (flat 2D layered arcs) */}
        <path
          d="M18 228 C78 184, 154 176, 224 196 C272 210, 316 196, 344 218 C348 222, 348 232, 342 238 C286 266, 82 268, 22 242 C14 238, 13 232, 18 228 Z"
          className="fill-[#c2e28b] dark:fill-[#273819]"
        />
        <path
          d="M30 242 C96 206, 206 204, 330 236 C338 238, 338 248, 330 254 C264 282, 98 282, 32 256 C24 252, 24 245, 30 242 Z"
          className="fill-[#9fd05e] dark:fill-[#33491f]"
        />

        {/* Winding cream pathway leading forward */}
        <path
          d="M196 190 C186 202, 168 208, 174 222 C180 236, 212 246, 228 269 L136 271 C146 246, 160 232, 164 220 C168 208, 180 198, 190 190 Z"
          className="fill-[#f4efe2] dark:fill-[#3c372f]"
        />
        {/* Subtle inner path edge highlight */}
        <path
          d="M192 192 C182 204, 168 210, 172 222 C176 234, 198 244, 206 268"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="stroke-[#e5decb] dark:stroke-[#4d463b]"
        />

        {/* Tiny pastoral wildflowers dotting the meadow */}
        <g aria-hidden="true">
          <circle cx="88" cy="244" r="2.6" className="fill-[#fffbeb] dark:fill-[#fef3c7]/80" />
          <circle cx="102" cy="252" r="2" className="fill-[#fdb913]" />
          <circle cx="118" cy="246" r="2.2" className="fill-[#fffbeb] dark:fill-[#fef3c7]/80" />
          <circle cx="246" cy="248" r="2.5" className="fill-[#fffbeb] dark:fill-[#fef3c7]/80" />
          <circle cx="262" cy="254" r="2.2" className="fill-[#f59e0b]" />
          <circle cx="276" cy="243" r="2" className="fill-[#fffbeb] dark:fill-[#fef3c7]/80" />
          <circle cx="294" cy="249" r="2.4" className="fill-[#fdb913]" />
        </g>

        {/* Ground contact shadows (subtle flat ellipses) */}
        <ellipse cx="134" cy="244" rx="16" ry="4" className="fill-[#5f8533]/25 dark:fill-black/35" />
        <ellipse cx="180" cy="248" rx="18" ry="4.5" className="fill-[#5f8533]/25 dark:fill-black/35" />
        <ellipse cx="226" cy="244" rx="16" ry="4" className="fill-[#5f8533]/25 dark:fill-black/35" />

        {/* Student 1 (Left): walking alongside with a Cru Gold backpack */}
        <g>
          {/* Backpack */}
          <rect
            x="114"
            y="167"
            width="13"
            height="25"
            rx="5"
            className="fill-cru-gold"
          />
          {/* Legs */}
          <path
            d="M129 202 L123 240 L129 242 L135 207 Z"
            className="fill-[#27272a] dark:fill-[#d4d4d8]"
          />
          <path
            d="M137 202 L145 239 L139 241 L132 206 Z"
            className="fill-[#18181b] dark:fill-[#a1a1aa]"
          />
          {/* Torso */}
          <path
            d="M123 166 C123 160, 144 160, 144 167 L145 203 C145 205, 123 205, 123 203 Z"
            className="fill-[#4d7c0f] dark:fill-[#65a30d]"
          />
          {/* Arm gesturing toward center friend */}
          <path
            d="M142 170 L155 186"
            strokeWidth="5.5"
            strokeLinecap="round"
            className="stroke-[#4d7c0f] dark:stroke-[#65a30d]"
          />
          {/* Head & hair */}
          <circle
            cx="134"
            cy="147"
            r="10.5"
            className="fill-[#27272a] dark:fill-[#e4e4e7]"
          />
          <path
            d="M123.5 145 C124 136, 134 134, 141 138 C144 140, 144.5 144, 143 145 C139 141, 130 141, 123.5 145 Z"
            className="fill-[#171717] dark:fill-[#f4f4f5]"
          />
        </g>

        {/* Student 2 (Center): focal figure in warm charcoal & Cru-gold scarf/collar */}
        <g>
          {/* Legs */}
          <path
            d="M174 202 L168 244 L175 245 L181 206 Z"
            className="fill-[#171717] dark:fill-[#e4e4e7]"
          />
          <path
            d="M183 202 L191 244 L184 245 L178 206 Z"
            className="fill-[#27272a] dark:fill-[#a1a1aa]"
          />
          {/* Torso / jacket */}
          <path
            d="M167 161 C167 154, 193 154, 193 161 L195 204 C195 206, 165 206, 165 204 Z"
            className="fill-[#1f2937] dark:fill-[#f5f5f5]"
          />
          {/* Warm Cru Gold accent stripe / scarf */}
          <path
            d="M172 158 Q180 165 188 158 L186 165 Q180 171 174 165 Z"
            className="fill-cru-gold"
          />
          {/* Left arm resting casually */}
          <path
            d="M168 166 L158 188"
            strokeWidth="5.5"
            strokeLinecap="round"
            className="stroke-[#1f2937] dark:stroke-[#f5f5f5]"
          />
          {/* Right arm reaching warmly toward Student 3 */}
          <path
            d="M192 166 L205 182"
            strokeWidth="5.5"
            strokeLinecap="round"
            className="stroke-[#1f2937] dark:stroke-[#f5f5f5]"
          />
          {/* Head */}
          <circle
            cx="180"
            cy="141"
            r="11.5"
            className="fill-[#171717] dark:fill-[#fafafa]"
          />
        </g>

        {/* Student 3 (Right): walking alongside with a shoulder tote */}
        <g>
          {/* Legs */}
          <path
            d="M220 202 L214 240 L220 241 L226 206 Z"
            className="fill-[#18181b] dark:fill-[#a1a1aa]"
          />
          <path
            d="M228 202 L236 240 L230 242 L223 206 Z"
            className="fill-[#27272a] dark:fill-[#d4d4d8]"
          />
          {/* Torso */}
          <path
            d="M214 166 C214 160, 236 160, 236 166 L238 203 C238 205, 212 205, 212 203 Z"
            className="fill-[#d97706] dark:fill-[#eab308]"
          />
          {/* Shoulder tote bag */}
          <rect
            x="234"
            y="186"
            width="14"
            height="16"
            rx="3.5"
            className="fill-[#f4efe2] stroke-[#a16207]/30 dark:fill-[#27272a] dark:stroke-white/15"
            strokeWidth="1.2"
          />
          <path
            d="M234 170 L240 186"
            strokeWidth="2"
            className="stroke-[#78350f]/50 dark:stroke-white/30"
          />
          {/* Left arm toward center friend */}
          <path
            d="M215 170 L204 185"
            strokeWidth="5.5"
            strokeLinecap="round"
            className="stroke-[#d97706] dark:stroke-[#eab308]"
          />
          {/* Head & ponytail silhouette */}
          <circle
            cx="225"
            cy="147"
            r="10.5"
            className="fill-[#27272a] dark:fill-[#e4e4e7]"
          />
          <circle
            cx="236.5"
            cy="146"
            r="4.2"
            className="fill-[#27272a] dark:fill-[#e4e4e7]"
          />
        </g>
      </svg>
    </div>
  );
}
