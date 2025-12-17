import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Sparkles, Globe, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import BackButton from '../components/ui/BackButton';
import KundliChat from '../components/kundli/KundliChat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function KundliGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    latitude: '',
    longitude: '',
    timezone_str: '',
    language: 'english',
    areas_of_interest: []
  });
  const [kundali, setKundali] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchLocationData = async (place) => {
    try {
      // Geocoding API
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY'}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
        throw new Error('Location not found. Please enter a valid place.');
      }

      const location = geocodeData.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      // Timezone API
      const timestamp = Math.floor(new Date().getTime() / 1000);
      const timezoneResponse = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY'}`
      );
      const timezoneData = await timezoneResponse.json();

      if (timezoneData.status !== 'OK') {
        throw new Error('Failed to fetch timezone data.');
      }

      const timezoneOffset = (timezoneData.rawOffset + timezoneData.dstOffset) / 3600;

      return { latitude, longitude, timezone_str: timezoneOffset.toString() };
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birth_date || !formData.birth_time || !formData.birth_place) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch location data (lat, lng, timezone)
      toast.info('Fetching location details...');
      const locationData = await fetchLocationData(formData.birth_place);

      const completeFormData = {
        ...formData,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timezone_str: locationData.timezone_str
      };

      // Generate Kundali
      toast.info('Generating your Kundali...');
      const response = await base44.functions.invoke('generateKundli', completeFormData);
      
      if (response.data.success) {
        toast.success('Kundali generated successfully! 🕉️');
        // Redirect to MyKundalis page
        navigate(createPageUrl('MyKundalis'));
      } else {
        toast.error(response.data.error || 'Failed to generate Kundali');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate Kundali');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Header with branding
    doc.setFillColor(255, 153, 0);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('🕉️ Divine', margin, 15);
    doc.setFontSize(10);
    doc.text('Vedic Horoscope Report', margin, 23);
    
    yPosition = 40;
    doc.setTextColor(0, 0, 0);

    // Personal Details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Personal Details', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${kundali.name}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Gender: ${kundali.gender}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Birth Date: ${kundali.birth_date}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Birth Time: ${kundali.birth_time}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Birth Place: ${kundali.birth_place}`, margin, yPosition);
    yPosition += 10;

    // Content
    const lines = doc.splitTextToSize(kundali.content, maxLineWidth);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });

    // Footer on last page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated by Divine | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`Kundali_${kundali.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const changeLanguage = async (newLanguage) => {
    if (newLanguage === formData.language) return;

    setIsGenerating(true);
    const updatedFormData = { ...formData, language: newLanguage };
    
    try {
      const response = await base44.functions.invoke('generateKundli', updatedFormData);
      
      if (response.data.success) {
        setKundali({
          ...updatedFormData,
          content: response.data.content,
          kundli_id: response.data.kundli_id
        });
        setFormData(updatedFormData);
        toast.success(`Report translated to ${newLanguage === 'hindi' ? 'Hindi' : 'English'}! 🕉️`);
      }
    } catch (error) {
      toast.error('Failed to translate');
    } finally {
      setIsGenerating(false);
    }
  };

  if (kundali) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <BackButton />

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Vedic Horoscope</h1>
              <p className="text-gray-600">Generated by Divine</p>
            </div>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with AI Astrologer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                  <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Chat with Vedic Astrologer AI</DialogTitle>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <KundliChat kundliId={kundali.kundli_id} userName={kundali.name} />
                  </div>
                </DialogContent>
              </Dialog>
              <Select value={formData.language} onValueChange={changeLanguage}>
                <SelectTrigger className="w-32">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={downloadPDF}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKundali(null);
                  setFormData({
                    name: '',
                    gender: 'male',
                    birth_date: '',
                    birth_time: '',
                    birth_place: '',
                    language: 'english',
                    areas_of_interest: []
                  });
                }}
              >
                Generate New
              </Button>
            </div>
          </div>

          <Card className="p-8 bg-white shadow-xl">
            {/* Personal Details Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4">Personal Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="opacity-80">Name</p>
                  <p className="font-semibold text-lg">{kundali.name}</p>
                </div>
                <div>
                  <p className="opacity-80">Gender</p>
                  <p className="font-semibold text-lg capitalize">{kundali.gender}</p>
                </div>
                <div>
                  <p className="opacity-80">Birth Date</p>
                  <p className="font-semibold text-lg">{kundali.birth_date}</p>
                </div>
                <div>
                  <p className="opacity-80">Birth Time</p>
                  <p className="font-semibold text-lg">{kundali.birth_time}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="opacity-80">Birth Place</p>
                  <p className="font-semibold text-lg">{kundali.birth_place}</p>
                </div>
              </div>
            </div>

            {/* Kundali Content */}
            <div className="prose prose-orange max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-orange-600 mt-8 mb-4 pb-2 border-b-2 border-orange-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-orange-700 mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 bg-orange-100 px-4 py-2 text-left font-semibold text-gray-800">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2">
                      {children}
                    </td>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-gray-700">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-orange-600">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-orange-500 pl-4 italic my-4 text-gray-600">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {kundali.content}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p className="mb-2">🕉️ Generated by Divine - India's Premier Spiritual Services Platform</p>
              <p>Bringing ancient Vedic wisdom to modern life</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <BackButton />

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Generate Your Kundali</h1>
          <p className="text-gray-600 text-lg">
            Get a comprehensive Vedic astrology report powered by AI
          </p>
        </div>

        <Card className="p-8 shadow-xl bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-base">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="birth_date" className="text-base">Date of Birth *</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="birth_time" className="text-base">Time of Birth *</Label>
              <Input
                id="birth_time"
                type="time"
                value={formData.birth_time}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="birth_place" className="text-base">Place of Birth *</Label>
              <Input
                id="birth_place"
                value={formData.birth_place}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                placeholder="City, State, Country"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="language" className="text-base">Report Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base">Areas of Interest (Optional)</Label>
              <p className="text-sm text-gray-500 mt-1 mb-3">Select areas you want detailed predictions for</p>
              <div className="grid grid-cols-2 gap-3">
                {['Career', 'Marriage', 'Health', 'Finances', 'Education', 'Relationships'].map((area) => {
                  const isSelected = formData.areas_of_interest.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            areas_of_interest: formData.areas_of_interest.filter(a => a !== area)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            areas_of_interest: [...formData.areas_of_interest, area]
                          });
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{area}</span>
                      {isSelected && <Check className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white py-6 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Kundali...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Kundali
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 leading-relaxed">
              <strong>Note:</strong> Your Kundali will be generated using advanced Vedic astrology calculations following the N.C. Lahiri Ayanamsa system. The report includes detailed predictions, dosha analysis, dasha periods, and personalized remedies.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}