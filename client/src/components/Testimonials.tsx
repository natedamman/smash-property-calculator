import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  quote: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Wilson H",
    quote: "They truly gave me the confidence to become a borderless investor. Their data driven knowledge and expertise really gave me the required helping hand to make the purchase — 60-70k below market value!",
    stars: 5,
  },
  {
    name: "Greg F",
    quote: "I'd been sitting on the fence for years missing out on potential gains. Since talking to Nick from Smash Property I'm on my way to purchasing my first investment property. I am much more confident in my choices.",
    stars: 5,
  },
  {
    name: "Sharon Y",
    quote: "Working with Nick to develop a personalised, tailored property investment strategy has been fantastic. Smash Property has been pivotal in helping us find the right property mix for our portfolio.",
    stars: 5,
  },
  {
    name: "Angus",
    quote: "Can't recommend Akira and Nick enough! From the first phone call to after settlement, they were both there to help in any way they could. Had all information on hand with great off-market opportunities!",
    stars: 5,
  },
  {
    name: "Bryn",
    quote: "Nick and Akira made the entire process as smooth as it could be, and were fantastic in their communication. I am very pleased with the off-market deal they secured for me!",
    stars: 5,
  },
  {
    name: "Natasha L",
    quote: "As a first time investor with no idea where to start, Nick and Akira have been amazing in helping me achieve my goals! Communication was prompt and I loved that I was able to learn from this experience.",
    stars: 5,
  },
  {
    name: "Shaun M",
    quote: "Nick stood out for his truly genuine and caring approach. He provided us with honest and straightforward advice and has helped create an investment strategy that gives my wife and I reassurance for our future.",
    stars: 5,
  },
  {
    name: "Cat S",
    quote: "If you're serious about investing, I strongly recommend Smash Property. I spent weeks in analysis-paralysis researching on my own. Nick and Akira guided me from start to finish, no hassle, no drama.",
    stars: 5,
  },
  {
    name: "Daniel L",
    quote: "Nick and Akira were highly professional and knowledgeable, prompt in communication and overall an absolute pleasure to deal with. Definitely recommend their service!",
    stars: 5,
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 200);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % testimonials.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + testimonials.length) % testimonials.length);
  }, [current, goTo]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <div className="mt-6 pt-6 border-t border-border/50" data-testid="testimonials-section">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">5.0 from Google Reviews</span>
      </div>

      <Card className="relative p-5 sm:p-6 bg-card/50 border-border/50">
        <Quote className="w-6 h-6 text-primary/20 absolute top-4 left-4" />

        <div
          className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          <p className="text-sm text-muted-foreground leading-relaxed pl-6 sm:pl-8 pr-2 italic">
            "{t.quote}"
          </p>
          <div className="flex items-center justify-between mt-4 pl-6 sm:pl-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{t.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <div className="flex gap-0.5">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={next}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </Card>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
