import type {
  RadarDiagnosis,
} from '../../../types/radar'

type DiagnosisFooterProps = {
  diagnosis: RadarDiagnosis
}

const statusStyles = {
  critical: {
    accent: 'bg-[#c94330]',
    badge: 'bg-[#fde9e5] text-[#bd432f]',
  },

  attention: {
    accent: 'bg-[#ed8b16]',
    badge: 'bg-[#fff0d8] text-[#9b5a0c]',
  },

  controlled: {
    accent: 'bg-[#3f8d68]',
    badge: 'bg-[#e8f4ed] text-[#28704f]',
  },
} as const

export function DiagnosisFooter({
  diagnosis,
}: DiagnosisFooterProps) {
  const styles =
    statusStyles[diagnosis.status]

  return (
    <section
      className="
        relative
        flex
        min-h-[50px]
        [@media(max-height:950px)]:min-h-[46px]
        items-center
        overflow-hidden
        rounded-[9px]
        bg-white
        px-[30px]
        shadow-[0_12px_28px_rgba(32,24,18,0.09)]
      "
    >
      <div
        className={`
          absolute
          bottom-0
          left-0
          top-0
          w-[8px]
          ${styles.accent}
        `}
      />

      <div
        className="
          flex
          min-w-0
          items-center
          gap-[16px]
        "
      >
        <span
          className={`
            shrink-0
            rounded-full
            px-[12px]
            py-[5px]
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.02em]
            ${styles.badge}
          `}
        >
          Diagnóstico
        </span>

        <p
          className="
            min-w-0
            text-[13px]
            leading-[1.35]
            text-[#292522]
          "
        >
          <strong className="font-bold">
            {diagnosis.headline}
          </strong>{' '}

          {diagnosis.detail}
        </p>
      </div>
    </section>
  )
}