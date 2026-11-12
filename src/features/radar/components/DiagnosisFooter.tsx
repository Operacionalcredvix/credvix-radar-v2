import type { RotatingDiagnosis } from '../radar.rotating-diagnosis'
import { useDiagnosisRotation } from '../../../hooks/useDiagnosisRotation'
import './DiagnosisFooter.css'

type DiagnosisFooterProps = {
  diagnoses: RotatingDiagnosis[]
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
  diagnoses,
}: DiagnosisFooterProps) {
  const activeIndex = useDiagnosisRotation()
  const activeSlot = diagnoses[activeIndex] ?? diagnoses[0]
  const activeStyles =
    statusStyles[activeSlot?.diagnosis.status ?? 'attention']

  return (
    <section
      data-diagnosis-slot={activeSlot?.id ?? 'unavailable'}
      aria-label={`Diagnóstico: ${activeSlot?.label ?? 'indisponível'}`}
      className="
        diagnosis-footer
        relative
        flex
        h-[50px]
        min-h-[50px]
        shrink-0
        [@media(max-height:950px)]:h-[46px]
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
        aria-hidden="true"
        className={`
          absolute
          bottom-0
          left-0
          top-0
          w-[8px]
          transition-colors
          duration-300
          ${activeStyles.accent}
        `}
      />

      <div className="relative h-full min-w-0 flex-1">
        {diagnoses.map((slot, index) => {
          const active = index === activeIndex
          const styles = statusStyles[slot.diagnosis.status]

          return (
            <div
              key={slot.id}
              data-diagnosis-entry={slot.id}
              data-active={String(active)}
              aria-hidden={!active}
              className="
                diagnosis-footer-slide
                absolute
                inset-0
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
                title={`${slot.diagnosis.headline} ${slot.diagnosis.detail}`}
                className="
                  diagnosis-footer-text
                  min-w-0
                  flex-1
                  text-[13px]
                  leading-[1.35]
                  text-[#292522]
                "
              >
                <strong className="font-bold">
                  {slot.diagnosis.headline}
                </strong>{' '}
                {slot.diagnosis.detail}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
