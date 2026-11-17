"use client";

import { QRCodeSVG } from "qrcode.react";
import { ClipboardList, ExternalLink } from "lucide-react";

// paste your Google Form link here
const SURVEY_URL = "https://forms.gle/33hyY6GTbUQwLQct9";
interface Props {
    survey_urls: string[]
    subtitles: {
        platform: string
        rest: string
    }[]
    finished: boolean
}

export default function SurveyCard({ survey_urls, subtitles, finished }: Props) {
    return (
        <section
            className={`flex flex-col gap-4 rounded-md border bg-white p-6 ${
                finished ? 'border-primary ring-2 ring-primary/15' : 'border-line'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
                    <ClipboardList className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold leading-snug">
                        {finished ? 'One last step' : 'Share your feedback'}
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-700">
                        {finished
                            ? 'You finished your test cases. Please answer our short survey.'
                            : 'After your test cases, answer our short survey about your experience with PRIME.'}
                    </p>
                </div>
            </div>

            {
                survey_urls.map((survey, i) => (
                    <>
                        <div className="flex flex-col items-center gap-2 rounded-xl bg-page px-4 py-5">
                            <div className="rounded-lg border border-line bg-white p-3">
                                <QRCodeSVG value={SURVEY_URL} size={160} level="M" bgColor="#FFFFFF" fgColor="#1A1F2B" />
                            </div>
                            <p className="text-[13px] text-subtle">
                                PRIME <span className="font-semibold text-ink">{subtitles[i].platform}</span> {subtitles[i].rest}
                            </p>
                        </div>

                        <a
                            href={survey}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-primary px-4 text-sm font-semibold ${
                                finished ? 'bg-primary text-white' : 'bg-white text-primary'
                            }`}
                        >
                            Open survey
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </>
                ))
            }
        </section>
    );
}