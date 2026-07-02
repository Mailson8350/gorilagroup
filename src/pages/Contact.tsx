import React, { useState } from "react";
import { Mail, Phone, MapPin, Check, MessageSquare, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useSettings } from "../contexts/SettingsContext";

export default function Contact() {
  const { siteConfig, t } = useSettings();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-secondary text-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-none">
            {t("contact_title")} <br />
          </h1>
          <p className="text-zinc-400 mt-8 max-w-xl text-lg">
            {t("contact_subtitle")}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-10 rounded-2xl shadow-2xl border border-zinc-100">
              <h3 className="text-xl font-display font-bold uppercase mb-8 border-b border-zinc-100 pb-4">{t("contact_info")}</h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{t("contact_location")}</p>
                    <p className="text-secondary font-bold">{siteConfig.contact_address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{t("contact_phone_label")}</p>
                    <p className="text-secondary font-bold">{siteConfig.contact_phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{t("contact_email_label")}</p>
                    <p className="text-secondary font-bold">{siteConfig.contact_email}</p>
                  </div>
                </div>
              </div>

              {siteConfig.contact_hours && (
                <div className="flex items-start space-x-4 mt-8">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{t("contact_hours_label")}</p>
                    <p className="text-secondary font-bold">{siteConfig.contact_hours}</p>
                  </div>
                </div>
              )}

              {siteConfig.contact_whatsapp && (
                <div className="mt-12 pt-8 border-t border-zinc-100">
                  <a
                    href={siteConfig.contact_whatsapp.startsWith("http") ? siteConfig.contact_whatsapp : `https://wa.me/${siteConfig.contact_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02]"
                  >
                    <MessageSquare size={20} />
                    <span>{t("contact_whatsapp_direct")}</span>
                  </a>
                </div>
              )}

              {siteConfig.contact_maps_url && (
                <div className="mt-6 rounded-xl overflow-hidden border border-zinc-100 aspect-video">
                  <iframe
                    title={t("contact_map_title")}
                    src={siteConfig.contact_maps_url}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-12 rounded-2xl shadow-2xl border border-zinc-100">
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8">{t("contact_form_title")}</h2>
              {status === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 p-10 rounded-2xl text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-emerald-900 mb-2">{t("contact_status_success")}</h3>
                  <p className="text-emerald-700">{t("contact_status_success_desc")}</p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="mt-8 text-emerald-600 font-bold hover:underline"
                  >
                    {t("contact_form_submit")}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">{t("contact_form_name")}</label>
                      <input 
                        name="nome" 
                        required 
                        type="text" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">{t("contact_form_email")}</label>
                      <input 
                        name="email" 
                        required 
                        type="email" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">{t("contact_form_subject")}</label>
                    <input 
                      name="assunto" 
                      required 
                      type="text" 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="Ex: Orçamento para Evento"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">{t("contact_form_message")}</label>
                    <textarea 
                      name="mensagem" 
                      required 
                      rows={6} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none" 
                      placeholder={t("contact_form_message_placeholder")}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className="w-full btn-primary py-5 text-lg shadow-xl"
                  >
                    {status === "loading" ? t("contact_status_loading") : t("contact_form_submit")}
                  </button>
                  {status === "error" && (
                    <p className="text-red-500 text-center font-bold text-sm">{t("contact_status_error")}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
