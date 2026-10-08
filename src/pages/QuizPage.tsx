import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import { moduleById } from "@/content";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NotFound from "./NotFound";

export default function QuizPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = moduleId ? moduleById(moduleId) : undefined;
  const { submitQuiz, quizBestByModule } = useProgress();

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => mod?.quiz ?? [], [mod]);

  if (!mod) return <NotFound />;

  const total = questions.length;
  const q = questions[step];
  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
  };

  const nextQuestion = () => {
    if (picked === null) return;
    const nextAnswers = [...answers, picked];
    setAnswers(nextAnswers);
    setPicked(null);
    if (step + 1 >= total) {
      setFinished(true);
      const finalScore = nextAnswers.filter((a, i) => a === questions[i]?.answer).length;
      submitQuiz(mod.id, finalScore, total);
      if (finalScore / total >= 0.7) {
        toast.success(`Quiz passed with ${finalScore}/${total} — best score saved.`);
      } else {
        toast.info(`Scored ${finalScore}/${total}. Review the lessons and try again!`);
      }
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  };

  const best = quizBestByModule[mod.id];

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          {passed ? (
            <Trophy className="mx-auto h-14 w-14 text-amber-500" aria-hidden />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-muted-foreground" aria-hidden />
          )}
          <h1 className="mt-4 font-display text-3xl font-bold">
            {passed ? "Quiz passed!" : "Almost there"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            You scored{" "}
            <strong className={passed ? "text-emerald-500" : "text-amber-500"}>
              {score} of {total} ({pct}%)
            </strong>{" "}
            on the {mod.title} quiz.
            {best && best.score > score && ` Your best remains ${best.score}/${best.totalQuestions}.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={restart} className="min-h-11 gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden /> Retake quiz
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link to={`/topics/${mod.id}`}>Review the lessons</Link>
            </Button>
            <Button asChild variant="ghost" className="min-h-11">
              <Link to="/quizzes">All quizzes</Link>
            </Button>
          </div>
        </div>

        {/* Review answers */}
        <section aria-labelledby="review">
          <h2 id="review" className="font-display text-lg font-semibold">
            Answer review
          </h2>
          <div className="mt-3 space-y-3">
            {questions.map((question, i) => {
              const mine = answers[i];
              const correct = mine === question.answer;
              return (
                <details key={i} className="rounded-xl border border-border bg-card p-4">
                  <summary className="flex cursor-pointer items-start gap-2 text-sm font-medium">
                    {correct ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-label="Correct" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-label="Incorrect" />
                    )}
                    {question.q}
                  </summary>
                  <div className="mt-2 space-y-1 pl-6 text-sm text-muted-foreground">
                    {!correct && (
                      <p>
                        Your answer: <span className="text-red-500">{question.options[mine]}</span>
                      </p>
                    )}
                    <p>
                      Correct answer:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {question.options[question.answer]}
                      </span>
                    </p>
                    <p className="pt-1">{question.explain}</p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-3">
        <Link
          to="/quizzes"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All quizzes
        </Link>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          {mod.title} — Quiz
        </h1>
        <div className="flex items-center gap-3">
          <Progress value={(step / total) * 100} className="h-2 flex-1" aria-label={`Question ${step + 1} of ${total}`} />
          <span className="text-sm font-medium text-muted-foreground">
            {step + 1}/{total}
          </span>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6" key={step}>
        <h2 className="font-display text-lg font-semibold leading-snug">{q.q}</h2>
        <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="Answer options">
          {q.options.map((option, i) => {
            const isPicked = picked === i;
            const isAnswer = q.answer === i;
            const revealed = picked !== null;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isPicked}
                onClick={() => choose(i)}
                disabled={revealed}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  !revealed && "border-border hover:border-primary/60 hover:bg-primary/5",
                  revealed && isAnswer && "border-emerald-500 bg-emerald-500/10",
                  revealed && isPicked && !isAnswer && "border-red-500 bg-red-500/10",
                  revealed && !isPicked && !isAnswer && "border-border opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-code text-xs font-bold",
                    revealed && isAnswer
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : revealed && isPicked
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-border text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div
            className={cn(
              "mt-4 animate-fade-up rounded-xl border p-4 text-sm leading-relaxed",
              picked === q.answer
                ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                : "border-red-500/40 bg-red-500/[0.07]",
            )}
            aria-live="polite"
          >
            <p className="font-semibold">
              {picked === q.answer ? "Correct!" : "Not quite."}
            </p>
            <p className="mt-1 text-foreground/85">{q.explain}</p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={nextQuestion}
            disabled={picked === null}
            className="min-h-11 gap-2"
          >
            {step + 1 >= total ? "Finish quiz" : "Next question"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
