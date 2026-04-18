"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface RequestForm {
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  expectedAttendance: number;
  organiserName: string;
  contactPhone: string;
  attachmentUrl?: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>();

  const onSubmit = async (data: RequestForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          expectedAttendance: Number(data.expectedAttendance),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Request submitted!", description: "Your request is now pending review." });
        router.push("/requests/mine");
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/requests/mine" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Submit Activity Request</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Event Title" required error={errors.title?.message}>
            <input
              {...register("title", { required: "Event title is required", minLength: { value: 3, message: "Min 3 characters" } })}
              placeholder="e.g. Community Clean-Up Drive"
              className="form-input"
            />
          </FormField>

          <FormField label="Description" required error={errors.description?.message}>
            <textarea
              {...register("description", { required: "Description is required", minLength: { value: 10, message: "Min 10 characters" } })}
              rows={3}
              placeholder="Describe the event and its purpose..."
              className="form-input"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Event Date" required error={errors.eventDate?.message}>
              <input
                type="date"
                {...register("eventDate", { required: "Event date is required" })}
                min={new Date().toISOString().split("T")[0]}
                className="form-input"
              />
            </FormField>

            <FormField label="Event Time" required error={errors.eventTime?.message}>
              <input
                type="time"
                {...register("eventTime", { required: "Event time is required" })}
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Venue" required error={errors.venue?.message}>
            <input
              {...register("venue", { required: "Venue is required", minLength: { value: 3, message: "Min 3 characters" } })}
              placeholder="e.g. Ainamoi Stadium, Kericho"
              className="form-input"
            />
          </FormField>

          <FormField label="Expected Attendance" required error={errors.expectedAttendance?.message}>
            <input
              type="number"
              min={1}
              {...register("expectedAttendance", { required: "Expected attendance is required", valueAsNumber: true, min: { value: 1, message: "Must be at least 1" } })}
              placeholder="e.g. 500"
              className="form-input"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Organiser Name" required error={errors.organiserName?.message}>
              <input
                {...register("organiserName", { required: "Organiser name is required" })}
                placeholder="Your name or organisation"
                className="form-input"
              />
            </FormField>

            <FormField label="Contact Phone" required error={errors.contactPhone?.message}>
              <input
                type="tel"
                {...register("contactPhone", { required: "Contact phone is required", minLength: { value: 10, message: "Min 10 digits" } })}
                placeholder="+254 7XX XXX XXX"
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Attachment URL (optional)" error={errors.attachmentUrl?.message}>
            <input
              type="url"
              {...register("attachmentUrl")}
              placeholder="https://... (Google Drive, Dropbox, etc.)"
              className="form-input"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Request"}
            </Button>
            <Link href="/requests/mine">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .form-input:focus {
          border-color: #2E7D32;
          box-shadow: 0 0 0 2px rgba(46,125,50,0.15);
        }
        textarea.form-input { resize: vertical; }
      `}</style>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
