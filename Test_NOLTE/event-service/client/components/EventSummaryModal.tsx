/**
 * Event Summary Modal Component
 * Beautiful modal for displaying AI-generated summary with SSE streaming
 */

'use client';

import { useState, useEffect } from 'react';
import { PublicEvent } from '../lib/types';
import { apiClient } from '../lib/api';

interface EventSummaryModalProps {
  event: PublicEvent;
  onClose: () => void;
}

export default function EventSummaryModal({ event, onClose }: EventSummaryModalProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let cancel: (() => void) | null = null;

    const loadSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSummary('');
        setIsTyping(true);

        cancel = await apiClient.streamEventSummary(
          event.id,
          (chunk) => {
            setSummary(prev => prev + chunk);
          },
          () => {
            setIsLoading(false);
            setIsTyping(false);
          },
          (err) => {
            setError(err.message);
            setIsLoading(false);
            setIsTyping(false);
          }
        );
      } catch (err: any) {
        setError(err.message || 'Failed to load summary');
        setIsLoading(false);
        setIsTyping(false);
      }
    };

    loadSummary();

    return () => {
      if (cancel) {
        cancel();
      }
    };
  }, [event.id]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="glass-card-intense rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-white/40 animate-in slide-in-from-bottom-4 duration-500">
        {/* Modal Header */}
        <div className="relative p-8 pb-6 border-b border-gray-200/50">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full blur-2xl"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1 pr-6">
              <h2 className="text-3xl font-bold text-gray-900 heading-display mb-4 leading-tight">
                {event.title}
              </h2>
              
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 mb-1">Date & Time</p>
                    <p className="text-blue-700 font-medium text-sm leading-relaxed">
                      {new Date(event.startAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-100/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 mb-1">Location</p>
                    <p className="text-emerald-700 font-medium text-sm leading-relaxed">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="group w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rotate-90 hover:shadow-lg"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <div className="p-8">
          {/* AI Summary Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 heading-display mb-1">AI-Generated Summary</h3>
              <p className="text-gray-600 font-medium">Powered by advanced language models</p>
            </div>
            
            {isLoading && (
              <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-purple-50/80 rounded-xl border border-purple-200/50">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-purple-700 text-sm font-semibold">Generating...</span>
              </div>
            )}
          </div>
          
          {/* Summary Content */}
          <div className="relative">
            {error ? (
              <div className="glass-card-intense rounded-2xl p-8 border-l-4 border-red-500 bg-gradient-to-r from-red-50/80 to-pink-50/80">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-red-800 font-bold text-lg mb-2">Failed to Generate Summary</h4>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card-intense rounded-2xl p-8 bg-gradient-to-br from-gray-50/80 to-white/80 border border-gray-200/50 min-h-[200px]">
                {isLoading && !summary ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin animation-delay-75"></div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Generating AI Summary</h4>
                    <p className="text-gray-600 text-center max-w-md">
                      Our AI is analyzing the event details and creating a comprehensive summary...
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-100"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce animation-delay-200"></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                      {summary}
                      {isTyping && (
                        <span className="inline-block w-3 h-6 bg-gradient-to-b from-purple-500 to-pink-500 ml-2 animate-pulse rounded-sm"></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">AI-Powered Insights</p>
                <p className="text-xs text-gray-600">Generated by advanced language models</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="btn-secondary px-8 py-3 font-bold"
            >
              Close Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
