'use client';

import { memo, useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, User, ArrowRight, Calendar as CalendarIcon } from "lucide-react"
import { motion } from "framer-motion"
import emailjs from '@emailjs/browser';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export const ContactSection = memo(function ContactSection() {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>('');

  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitStatus('sending');
    setSubmitMessage('');

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    try {
      // 1) Always store the inquiry (used by Admin -> Inquiries tab)
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || null,
          message,
          sourceUrl: typeof window !== 'undefined' ? window.location.href : null,
        }),
      });

      const payload = (await res.json().catch(() => null)) as null | { ok?: boolean; error?: string };
      if (!res.ok || payload?.ok === false) {
        throw new Error(payload?.error || 'Failed to submit inquiry');
      }

      // 2) Optional: send EmailJS (best-effort)
      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            First_Name: firstName,
            Last_Name: lastName,
            Email: email,
            Phone: phone,
            Message: message,
          },
          { publicKey }
        );
      }

      setSubmitStatus('success');
      setSubmitMessage("Thanks — your message has been sent.");
      form.reset();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('EmailJS send failed:', error);
      setSubmitStatus('error');
      setSubmitMessage('Sorry — something went wrong sending your message. Please try again.');
    }
  }, []);

  return (
    <section id="contact" className="relative overflow-hidden bg-white pt-32 pb-24 text-slate-900 md:pt-40 md:pb-28" aria-labelledby="contact-heading">
       <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 md:px-6 lg:gap-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-4">
            <h1 id="contact-heading" className="text-[44px] font-semibold tracking-tight text-slate-900 md:text-6xl lg:text-7xl leading-[1.1]">
              Get in <span className="text-slate-400">Touch.</span>
            </h1>
            <p className="max-w-[800px] text-base text-slate-500 md:text-lg leading-relaxed">
               We're here to help you streamline your operations and grow your business. Reach out to us directly or fill out the form.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Contact Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10"
            >
                 {/* Content similar to bento grid card */}
                 <address className="flex flex-col gap-10 h-full justify-between not-italic">
                    <div className="space-y-8">
                        {/* Email */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-slate-900 font-semibold text-xl">
                                <div className="p-2 rounded-full bg-orange-100 text-[#F75834]" aria-hidden="true">
                                    <Mail className="h-5 w-5" />
                                </div>
                                Company Email
                            </div>
                            <p className="text-slate-500 pl-12">
                              <a href="mailto:info@ontriq.com" className="hover:text-[#F75834] transition-colors">
                                info@ontriq.com
                              </a>
                            </p>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-slate-900 font-semibold text-xl">
                                <div className="p-2 rounded-full bg-orange-100 text-[#F75834]" aria-hidden="true">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                Company Address
                            </div>
                            <div className="text-slate-500 pl-12">
                                <p>107 Colombo - Galle Main Rd,</p>
                                <p>Dehiwala-Mount Lavinia Sri Lanka</p>
                            </div>
                        </div>

                        {/* Book a Meeting */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-slate-900 font-semibold text-xl">
                                <div className="p-2 rounded-full bg-orange-100 text-[#F75834]" aria-hidden="true">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                Book a Meeting
                            </div>
                            <div className="pl-12">
                                <p className="text-slate-500 mb-2">
                                    Schedule a 30-minute call with our team.
                                </p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="inline-flex items-center gap-2 text-[#F75834] font-medium hover:underline">
                                            Schedule Now <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] h-[600px] p-0 overflow-hidden bg-white">
                                        <DialogTitle className="sr-only">Book a Meeting</DialogTitle>
                                        <iframe 
                                            src="https://calendly.com/ontriq-info-vkls/30min" 
                                            width="100%" 
                                            height="100%" 
                                            frameBorder="0" 
                                            title="Schedule a meeting"
                                        ></iframe>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Key Contacts */}
                         <div className="space-y-6">
                            <div className="flex items-center gap-3 text-slate-900 font-semibold text-xl">
                                <div className="p-2 rounded-full bg-orange-100 text-[#F75834]" aria-hidden="true">
                                    <User className="h-5 w-5" />
                                </div>
                                Key Contacts
                            </div>
                            <div className="pl-12 space-y-6">
                                <div>
                                    <p className="font-medium text-slate-900">Abdul Rahuman</p>
                                    <p className="text-sm text-[#F75834] mb-1">VP Operations / Director</p>
                                    <p className="text-sm text-slate-500">
                                      <a href="tel:+94779996940" className="hover:text-[#F75834] transition-colors">077 999 6940</a>
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      <a href="mailto:abdul@ontriq.com" className="hover:text-[#F75834] transition-colors">abdul@ontriq.com</a>
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Arafath Dawood</p>
                                    <p className="text-sm text-[#F75834] mb-1">Director Operations</p>
                                    <p className="text-sm text-slate-500">
                                      <a href="tel:+94777740041" className="hover:text-[#F75834] transition-colors">077 774 0041</a>
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      <a href="mailto:arafath@ontriq.com" className="hover:text-[#F75834] transition-colors">arafath@ontriq.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </address>
            </motion.div>

            {/* Right Column: Form Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm"
            >
              <form className="space-y-6" aria-label="Contact form" onSubmit={onSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="first-name" className="text-slate-700">First Name</Label>
                            <Input id="first-name" name="firstName" placeholder="Enter your first name" className="bg-slate-50 border-slate-200 focus-visible:ring-[#F75834]" autoComplete="given-name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name" className="text-slate-700">Last Name</Label>
                            <Input id="last-name" name="lastName" placeholder="Enter your last name" className="bg-slate-50 border-slate-200 focus-visible:ring-[#F75834]" autoComplete="family-name" required />
                        </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="Enter your email" className="bg-slate-50 border-slate-200 focus-visible:ring-[#F75834]" autoComplete="email" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="Enter your phone" className="bg-slate-50 border-slate-200 focus-visible:ring-[#F75834]" autoComplete="tel" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-700">Message</Label>
                        <Textarea 
                            id="message"
                            name="message"
                            placeholder="How can we help you?" 
                            className="min-h-[150px] bg-slate-50 border-slate-200 resize-none focus-visible:ring-[#F75834]"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={submitStatus === 'sending'}
                        className="group inline-flex items-center gap-3 rounded-full bg-[#F75834] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#e04826] focus:outline-none focus:ring-2 focus:ring-[#F75834] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitStatus === 'sending' ? 'Sending...' : 'Send Message'}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </button>

                    {submitMessage ? (
                      <p role="status" aria-live="polite" className="text-sm text-slate-500">
                        {submitMessage}
                      </p>
                    ) : null}
                </form>
            </motion.div>
        </div>
       </div>
    </section>
  )
});
