import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import { generateResponse, getQuickActions, getConversationStarters } from '../services/chatService';
import { pageTransition } from '../utils/animations';
import './ChatAssistant.css';

const ChatAssistant = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hello! I'm your recycling assistant. How can I help you recycle smarter today?",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (text = inputValue) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await generateResponse(text, messages);

            setIsTyping(false);

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.message,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
            setSuggestions(response.suggestions || []);
        } catch (error) {
            setIsTyping(false);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickAction = (action) => {
        if (action.action === 'navigate') {
            navigate(action.target);
        } else if (action.action === 'message') {
            handleSendMessage(action.message);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(suggestion);
    };

    const quickActions = getQuickActions();
    const conversationStarters = getConversationStarters();

    return (
        <motion.div className="chat-assistant-page" {...pageTransition}>
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate('/')}
                    >
                        Back
                    </Button>
                    <div className="chat-header-title">
                        <Sparkles size={24} className="sparkle-icon" />
                        <h1 className="page-title">AI Assistant</h1>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="chat-container glass-card">
                    {/* Messages */}
                    <div className="messages-container">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    className={`message message-${message.type}`}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="message-avatar">
                                        {message.type === 'bot' ? '🤖' : '👤'}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-bubble">
                                            {message.text}
                                        </div>
                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                className="message message-bot"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <motion.div
                            className="suggestions-container"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="suggestions-label">Suggested questions:</div>
                            <div className="suggestions-list">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="suggestion-chip"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Actions */}
                    {messages.length === 1 && (
                        <motion.div
                            className="quick-actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="quick-actions-label">Quick Actions:</div>
                            <div className="quick-actions-grid">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.id}
                                        className="quick-action-button"
                                        onClick={() => handleQuickAction(action)}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>

                            <div className="conversation-starters">
                                <div className="starters-label">Or try asking:</div>
                                {conversationStarters.slice(0, 3).map((starter, index) => (
                                    <button
                                        key={index}
                                        className="starter-button"
                                        onClick={() => handleSendMessage(starter)}
                                    >
                                        "{starter}"
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Input */}
                    <div className="input-container">
                        <textarea
                            ref={inputRef}
                            className="message-input"
                            placeholder="Ask me anything about recycling..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows={1}
                        />
                        <Button
                            variant="primary"
                            icon={<Send size={20} />}
                            onClick={() => handleSendMessage()}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatAssistant;
