import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Share2,
  BookOpen,
  Loader2,
  Quote,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';

export default function SacredStories({ 
  stories, 
  loading, 
  selectedLanguage, 
  onLanguageChange 
}) {
  const [expandedStory, setExpandedStory] = useState(null);
  const [likedStories, setLikedStories] = useState(new Set());
  const [showReferences, setShowReferences] = useState({});

  const handleLike = (index) => {
    const newLiked = new Set(likedStories);
    if (newLiked.has(index)) {
      newLiked.delete(index);
    } else {
      newLiked.add(index);
      toast.success('Added to your favorites');
    }
    setLikedStories(newLiked);
  };

  const handleShare = async (story) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.heading,
          text: story.content.substring(0, 200) + '...',
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(story);
        }
      }
    } else {
      copyToClipboard(story);
    }
  };

  const copyToClipboard = (story) => {
    navigator.clipboard.writeText(`${story.heading}\n\n${story.content}`);
    toast.success('Copied to clipboard');
  };

  const handleRead = (story) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${story.heading}. ${story.content}`);
      utterance.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      toast.success('Reading story aloud');
    } else {
      toast.error('Text-to-speech not supported in your browser');
    }
  };

  const toggleReferences = (index) => {
    setShowReferences(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-3 text-gray-600">Discovering sacred stories...</span>
        </div>
      </Card>
    );
  }

  if (!stories) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Sacred Stories & History</h2>
        </div>
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="hindi">हिन्दी</SelectItem>
            <SelectItem value="sanskrit">संस्कृत</SelectItem>
            <SelectItem value="tamil">தமிழ்</SelectItem>
            <SelectItem value="telugu">తెలుగు</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {stories.title && (
        <h3 className="text-2xl font-serif text-orange-800 mb-6 text-center">
          {stories.title}
        </h3>
      )}

      <div className="space-y-6">
        {stories.stories?.map((story, idx) => (
          <Card key={idx} className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
                {story.heading}
              </h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLike(idx)}
                  className={likedStories.has(idx) ? 'text-red-500' : 'text-gray-400'}
                >
                  <Heart className={`w-4 h-4 ${likedStories.has(idx) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleShare(story)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRead(story)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="prose prose-sm prose-orange max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {expandedStory === idx || story.content.length < 500
                  ? story.content
                  : `${story.content.substring(0, 500)}...`}
              </p>
            </div>

            {story.content.length > 500 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedStory(expandedStory === idx ? null : idx)}
                className="mt-3 text-orange-600 hover:text-orange-700"
              >
                {expandedStory === idx ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Read More
                  </>
                )}
              </Button>
            )}

            {/* Quotes Section */}
            {story.quotes?.length > 0 && (
              <div className="mt-4 pl-4 border-l-4 border-orange-300 bg-orange-50/50 p-3 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Quote className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    {story.quotes.map((quote, qIdx) => (
                      <p key={qIdx} className="text-sm text-gray-700 italic">
                        "{quote}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* References Section */}
            {story.references?.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReferences(idx)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {showReferences[idx] ? 'Hide' : 'Show'} References ({story.references.length})
                </Button>
                
                {showReferences[idx] && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Sources & Citations:</p>
                    <ul className="space-y-1">
                      {story.references.map((ref, rIdx) => (
                        <li key={rIdx} className="text-xs text-blue-800">
                          [{rIdx + 1}] {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Overall Scriptural References */}
      {stories.scriptural_references && (
        <Card className="mt-6 p-4 bg-white/80 border-2 border-orange-200">
          <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Scriptural References
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {stories.scriptural_references}
          </p>
        </Card>
      )}

      {/* Citations */}
      {stories.citations?.length > 0 && (
        <Card className="mt-4 p-4 bg-blue-50/50 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Additional Sources
          </h4>
          <div className="space-y-1">
            {stories.citations.map((citation, idx) => (
              <a
                key={idx}
                href={citation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                {citation}
              </a>
            ))}
          </div>
        </Card>
      )}
    </Card>
  );
}