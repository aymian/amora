import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const ROLES = {
    "Executive & Operations": ["Platform Manager", "Executive Secretary"],
    "Payments & Security": ["Payment Verifier", "Trust & Safety Analyst"],
    "Content Operations": ["Image Content Manager", "Short-Video Manager", "Mood Content Manager", "Happy Content Curator", "Sad Content Curator", "Music Content Manager"],
    "Community & Support": ["Community Moderator", "Community Support Agent"],
    "Speed & Monitoring": ["Queue Manager", "Rapid Response Operator", "Emergency Operator"],
    "Quality & Analytics": ["Quality Reviewer", "Brand Tone Reviewer", "Performance Analyst"]
};

export default function Apply() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        displayName: "",
        email: "",
        phone: "",
        location: "",
        age: "",
        role: "",
        otherRole: "",
        skills: "",
        experience: "",
        portfolio_drive: "",
        portfolio_social: "",
        portfolio_web: "",
        portfolio_other: "",
        hoursPerDay: "",
        preferredTime: "",
        available5Days: "",
        term1: false,
        term2: false,
        term3: false,
        term4: false,
        motivation: "",
        expectation: "",
        expectationOther: "",
        agreeRules: "",
        fraudCheck: "",
        final1: false,
        final2: false,
        final3: false
    });

    const handleInput = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const validate = () => {
        if (!formData.fullName || !formData.email || !formData.phone) return "Personal information missing.";
        if (parseInt(formData.age) < 18) return "You must be 18+ to apply.";
        if (!formData.role && !formData.otherRole) return "Please select a role.";
        if (!formData.skills) return "Please describe your skills.";
        if (!formData.hoursPerDay) return "Availability required.";
        if (!formData.term1 || !formData.term2 || !formData.term3 || !formData.term4) return "You must accept all salary conditions.";
        if (formData.fraudCheck !== "No") return "Eligibility requirement not met.";
        if (!formData.final1 || !formData.final2 || !formData.final3) return "Please confirm final declarations.";
        return null;
    };

    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "applications"), {
                ...formData,
                status: "pending",
                reply: "",
                createdAt: serverTimestamp()
            });
            setSubmitted(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            toast.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-[#e9c49a]/10 rounded-full flex items-center justify-center mx-auto border border-[#e9c49a]/20">
                        <CheckCircle2 className="w-10 h-10 text-[#e9c49a]" />
                    </div>
                    <h1 className="text-3xl font-display text-[#e9c49a]">Application Received</h1>
                    <p className="text-white/60 font-light leading-relaxed">
                        Thank you for applying to Amorra.<br />
                        Your application has been securely recorded.<br />
                        If selected, you will be contacted when roles are assigned.
                    </p>
                    <Button onClick={() => window.location.href = '/'} variant="outline" className="border-[#e9c49a]/30 text-[#e9c49a] hover:bg-[#e9c49a]/10">
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <header className="py-8 text-center border-b border-white/5 bg-[#080808]">
                <Logo className="h-8 mx-auto mb-4" />
                <h1 className="text-2xl md:text-3xl font-display font-light uppercase tracking-widest text-[#e9c49a]">
                    Official Team Application
                </h1>
                <p className="text-xs text-white/40 mt-2 uppercase tracking-[0.2em]">Salary-Based · Early Stage</p>
            </header>

            <main className="max-w-3xl mx-auto p-6 md:p-12 space-y-12">
                {/* Intro */}
                <section className="space-y-4 text-center pb-8 border-b border-white/5">
                    <p className="text-white/60 font-light leading-relaxed max-w-2xl mx-auto">
                        Amorra is an early-stage digital platform focused on emotions, stories, visuals, and short-form content.
                        The platform is currently under development and not yet generating revenue.
                        We are building the core team that will help launch and operate the platform professionally.
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-left">
                        <h3 className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <AlertCircle className="w-4 h-4" /> Important Notice
                        </h3>
                        <p className="text-red-200/80 text-sm leading-relaxed">
                            All roles listed below are salary-based, but <strong>payment will start only after the platform begins earning income.</strong><br />
                            There is no ownership or profit sharing for team members.<br />
                            Please apply only if you fully understand and accept this condition.
                        </p>
                    </div>
                </section>

                <div className="space-y-8">
                    {/* SECTION 1 */}
                    <Section title="1. Personal Information">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Field label="Full Name (Required)">
                                <Input value={formData.fullName} onChange={e => handleInput("fullName", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                            <Field label="Display Name / Username">
                                <Input value={formData.displayName} onChange={e => handleInput("displayName", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                            <Field label="Email Address">
                                <Input type="email" value={formData.email} onChange={e => handleInput("email", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                            <Field label="Phone / WhatsApp">
                                <Input value={formData.phone} onChange={e => handleInput("phone", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                            <Field label="Country & City">
                                <Input value={formData.location} onChange={e => handleInput("location", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                            <Field label="Age">
                                <Input type="number" placeholder="18+" value={formData.age} onChange={e => handleInput("age", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                        </div>
                    </Section>

                    {/* SECTION 2 */}
                    <Section title="2. Role Application">
                        <div className="space-y-6">
                            <RadioGroup onValueChange={v => handleInput("role", v)}>
                                {Object.entries(ROLES).map(([cat, roles]) => (
                                    <div key={cat} className="space-y-3 mb-6">
                                        <h4 className="text-xs uppercase tracking-widest text-[#e9c49a] font-bold">{cat}</h4>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {roles.map(role => (
                                                <div key={role} className="flex items-center space-x-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5">
                                                    <RadioGroupItem value={role} id={role} className="border-white/20 text-[#e9c49a]" />
                                                    <Label htmlFor={role} className="text-sm font-light cursor-pointer text-white/80">{role}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                            <div className="pt-4 border-t border-white/5">
                                <Field label="Other Role (Specify)">
                                    <Input value={formData.otherRole} onChange={e => handleInput("otherRole", e.target.value)} placeholder="If your ideal role isn't listed..." className="bg-white/5 border-white/10" />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    {/* SECTION 3 */}
                    <Section title="3. Skills & Experience">
                        <div className="space-y-6">
                            <Field label="Briefly describe your skills (Required)">
                                <Textarea value={formData.skills} onChange={e => handleInput("skills", e.target.value)} placeholder="Example: payment verification, moderation, organization..." className="bg-white/5 border-white/10 h-32" />
                            </Field>
                            <Field label="Previous Experience (Optional)">
                                <Textarea value={formData.experience} onChange={e => handleInput("experience", e.target.value)} className="bg-white/5 border-white/10 h-24" />
                            </Field>
                            <div className="space-y-4">
                                <Label className="text-xs uppercase tracking-widest text-white/40">Portfolio / Proof of Work (Optional)</Label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input placeholder="Google Drive Link" value={formData.portfolio_drive} onChange={e => handleInput("portfolio_drive", e.target.value)} className="bg-white/5 border-white/10" />
                                    <Input placeholder="Instagram / TikTok" value={formData.portfolio_social} onChange={e => handleInput("portfolio_social", e.target.value)} className="bg-white/5 border-white/10" />
                                    <Input placeholder="Website / GitHub" value={formData.portfolio_web} onChange={e => handleInput("portfolio_web", e.target.value)} className="bg-white/5 border-white/10" />
                                    <Input placeholder="Other Links" value={formData.portfolio_other} onChange={e => handleInput("portfolio_other", e.target.value)} className="bg-white/5 border-white/10" />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* SECTION 4 */}
                    <Section title="4. Availability & Commitment">
                        <div className="space-y-6">
                            <Field label="How many hours can you work per day?">
                                <SelectGroup
                                    options={["1–2 hours", "3–4 hours", "5+ hours"]}
                                    selected={formData.hoursPerDay}
                                    onChange={v => handleInput("hoursPerDay", v)}
                                />
                            </Field>
                            <Field label="Preferred working time">
                                <SelectGroup
                                    options={["Morning", "Afternoon", "Evening", "Flexible"]}
                                    selected={formData.preferredTime}
                                    onChange={v => handleInput("preferredTime", v)}
                                />
                            </Field>
                            <Field label="Are you available at least 5 days per week?">
                                <SelectGroup
                                    options={["Yes", "No"]}
                                    selected={formData.available5Days}
                                    onChange={v => handleInput("available5Days", v)}
                                />
                            </Field>
                        </div>
                    </Section>

                    {/* SECTION 5 */}
                    <Section title="5. Salary & Payment Understanding">
                        <div className="bg-white/[0.02] p-6 rounded-2xl space-y-4 border border-white/5">
                            {[
                                { k: "term1", l: "I understand that Amorra is currently pre-revenue." },
                                { k: "term2", l: "I understand that salary payments will start only after the platform earns income." },
                                { k: "term3", l: "I understand that this role does not include ownership or profit sharing." },
                                { k: "term4", l: "I agree to work during the early stage based on trust and future payment." }
                            ].map(item => (
                                <div key={item.k} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={item.k}
                                        checked={formData[item.k as keyof typeof formData] as boolean}
                                        onCheckedChange={(c) => handleInput(item.k, c === true)}
                                        className="border-white/20 data-[state=checked]:bg-[#e9c49a] data-[state=checked]:text-black"
                                    />
                                    <Label htmlFor={item.k} className="text-sm font-light leading-snug cursor-pointer text-white/80">{item.l}</Label>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* SECTION 6 */}
                    <Section title="6. Motivation">
                        <div className="space-y-6">
                            <Field label="Why do you want to join Amorra?">
                                <Textarea value={formData.motivation} onChange={e => handleInput("motivation", e.target.value)} className="bg-white/5 border-white/10" />
                            </Field>
                            <Field label="What do you expect from this collaboration?">
                                <SelectGroup
                                    options={["Experience", "Long-term salary", "Skill growth", "Team environment"]}
                                    selected={formData.expectation}
                                    onChange={v => handleInput("expectation", v)}
                                />
                            </Field>
                        </div>
                    </Section>

                    {/* SECTION 7 */}
                    <Section title="7. Trust, Ethics & Conduct">
                        <div className="space-y-6">
                            <Field label="Do you agree to follow Amorra rules, confidentiality, and professional conduct?">
                                <SelectGroup options={["Yes", "No"]} selected={formData.agreeRules} onChange={v => handleInput("agreeRules", v)} />
                            </Field>
                            <Field label="Have you ever been involved in fraud, scams, or dishonest online activity?">
                                <SelectGroup options={["No", "Yes"]} selected={formData.fraudCheck} onChange={v => handleInput("fraudCheck", v)} />
                            </Field>
                        </div>
                    </Section>

                    {/* SECTION 8 */}
                    <Section title="8. Final Confirmation">
                        <div className="space-y-4 px-4">
                            {[
                                { k: "final1", l: "I confirm that all information provided is true." },
                                { k: "final2", l: "I understand this application does not guarantee selection." },
                                { k: "final3", l: "I am applying voluntarily and professionally." }
                            ].map(item => (
                                <div key={item.k} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={item.k}
                                        checked={formData[item.k as keyof typeof formData] as boolean}
                                        onCheckedChange={(c) => handleInput(item.k, c === true)}
                                        className="border-white/20 data-[state=checked]:bg-[#e9c49a] data-[state=checked]:text-black"
                                    />
                                    <Label htmlFor={item.k} className="text-sm font-light cursor-pointer text-white/80">{item.l}</Label>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <div className="pt-8">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-6 text-lg font-bold uppercase tracking-[0.2em] bg-[#e9c49a] text-black hover:bg-white rounded-2xl shadow-[0_0_30px_rgba(233,196,154,0.2)]"
                        >
                            {loading ? "Submitting..." : "Apply to Join Amorra"}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="space-y-6">
            <h3 className="text-lg font-display text-white border-b border-white/5 pb-2 uppercase tracking-wider opacity-80">{title}</h3>
            {children}
        </section>
    );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-white/40">{label}</Label>
            {children}
        </div>
    );
}

function SelectGroup({ options, selected, onChange }: { options: string[], selected: string, onChange: (v: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${selected === opt
                        ? "bg-[#e9c49a] border-[#e9c49a] text-black font-bold"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
