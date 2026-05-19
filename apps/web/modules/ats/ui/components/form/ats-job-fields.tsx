interface AtsJobFieldsProps {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  keywordText: string;
  onJobTitleChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onKeywordTextChange: (value: string) => void;
}

const inputClassName =
  "h-9 border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50";

const textareaClassName =
  "resize-y border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50";

const AtsJobFields = ({
  jobTitle,
  companyName,
  jobDescription,
  keywordText,
  onJobTitleChange,
  onCompanyNameChange,
  onJobDescriptionChange,
  onKeywordTextChange,
}: AtsJobFieldsProps) => (
  <>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      <div className="flex items-center gap-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Target role</span>
          <input
            value={jobTitle}
            onChange={(event) => onJobTitleChange(event.target.value)}
            className={`${inputClassName} w-full`}
            placeholder="Backend engineer"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Company</span>
          <input
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            className={`${inputClassName} w-full`}
            placeholder="Acme"
          />
        </label>
      </div>
    </div>

    <label className="grid gap-2 text-sm">
      <span className="font-medium">Job description</span>
      <textarea
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
        className={`min-h-56 ${textareaClassName}`}
        placeholder="Paste the role description here..."
      />
    </label>

    <label className="grid gap-2 text-sm">
      <span className="font-medium">Priority keywords</span>
      <textarea
        value={keywordText}
        onChange={(event) => onKeywordTextChange(event.target.value)}
        className={`min-h-20 ${textareaClassName}`}
        placeholder="Python, FastAPI, SQL"
      />
    </label>
  </>
);

export default AtsJobFields;
