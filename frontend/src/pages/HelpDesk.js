import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaRobot, FaUser, FaTicketAlt, FaHistory, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/apiConfig';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: var(--spacing-md);
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background-color: var(--background-primary);
  color: var(--text-primary);
  gap: var(--spacing-sm);
  
  @media (max-width: 768px) {
    padding: var(--spacing-sm);
    height: calc(100vh - 60px);
  }
`;

const Header = styled.div`
  margin-bottom: var(--spacing-sm);
`;

const TabContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap; 
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${props => props.active ? 'var(--primary-color, #4a90e2)' : 'var(--background-secondary, #ffffff)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary, #666)'};
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-size: var(--font-body);
  flex: 1;
  min-width: 150px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

// Chat Styles
const ChatWindow = styled.div`
  flex: 1;
  background: var(--background-secondary, #ffffff);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color, #e0e0e0);
`;

const ChatHeader = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color, #4a90e2);
  color: white;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  font-size: var(--font-h3);
`;

const MessagesArea = styled.div`
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const MessageBubble = styled.div`
  max-width: 85%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  line-height: 1.5;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? 'var(--primary-color, #4a90e2)' : 'var(--background-tertiary, #f0f2f5)'};
  color: ${props => props.isUser ? 'white' : 'var(--text-primary, #333)'};
  font-size: var(--font-body);
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px;
  span {
    width: 8px; height: 8px; background: #999; border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
`;

const QuickHelpContainer = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-color);
  
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
`;

const QuickActionChip = styled.button`
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: var(--font-sm);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { background: var(--primary-color); color: white; }
`;

const InputArea = styled.form`
  padding: var(--spacing-sm);
  background: var(--background-secondary, #ffffff);
  border-top: 1px solid var(--border-color, #e0e0e0);
  display: flex;
  gap: var(--spacing-sm);
`;

const Input = styled.input`
  flex: 1; padding: 0.75rem 1rem; border-radius: 20px;
  border: 1px solid var(--border-color, #ccc); outline: none;
  font-size: var(--font-body);
`;

const SendButton = styled.button`
  background: var(--primary-color, #4a90e2);
  color: white; border: none; width: 45px; height: 45px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
  &:disabled { background: #ccc; }
`;

// Ticket Styles
const TicketContainer = styled.div`
  flex: 1;
  display: flex;
  gap: var(--spacing-md);
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

const TicketConfig = styled.div`
  flex: 1;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow-y: auto;
`;

const HistorySection = styled.div`
  flex: 1;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
`;

const FormTitle = styled.h3`
  margin-bottom: var(--spacing-md);
  display: flex; align-items: center; gap: 0.5rem;
  color: var(--text-primary);
  font-size: var(--font-h3);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-sm);
  label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: var(--font-sm); }
  input, textarea, select {
    width: 100%; padding: 0.75rem; border-radius: 8px;
    border: 1px solid var(--border-color, #ccc);
    background: var(--background-input, #fff);
     color: var(--text-primary, #333);
    outline: none;
    font-size: var(--font-body);
    &:focus { border-color: var(--primary-color); }
  }
  textarea { height: 120px; resize: vertical; }
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: var(--primary-color);
  color: white; border: none; border-radius: 8px;
  font-weight: 600; cursor: pointer; width: 100%;
  font-size: var(--font-body);
  &:hover { background: var(--primary-dark); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const TicketCard = styled.div`
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color, #eee);
  border-radius: 8px;
  margin-bottom: 0.8rem;
  background: var(--background-tertiary, #f9f9f9);
  transition: transform 0.1s;
  &:hover { transform: translateX(4px); border-left: 3px solid var(--primary-color); }
`;

const StatusBadge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: var(--font-sm);
  font-weight: 600;
  background: ${props => props.status === 'OPEN' ? '#fff3cd' : '#d4edda'};
  color: ${props => props.status === 'OPEN' ? '#856404' : '#155724'};
`;

const HelpDesk = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm BudgetWise AI. I can help with expense tracking, budgeting advice, and app features.", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Ticket State
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'chat') scrollToBottom();
    if (activeTab === 'tickets') fetchTickets();
  }, [messages, activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTickets = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'user123'; // Mock or real ID
      const res = await fetch(`${API_BASE_URL}/api/helpdesk/complaints/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/helpdesk/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, isUser: false }]);
    } catch (error) {
      toast.error("Failed to connect.");
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection error. Please try again.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) { toast.warn("Please fill all fields"); return; }

    setTicketLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      const res = await fetch(`${API_BASE_URL}/api/helpdesk/complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          email: user.email || 'user@example.com',
          subject,
          description
        })
      });

      if (res.ok) {
        toast.success("Ticket raised! Confirmation email sent.");
        setSubject(''); setDescription('');
        fetchTickets();
      } else { throw new Error("Failed"); }
    } catch (error) {
      toast.error("Failed to submit ticket.");
    } finally {
      setTicketLoading(false);
    }
  };

  const quickActions = [
    "How do I add an expense?", "Reset my password", "Export reports", "Set a budget goal"
  ];

  return (
    <Container>
      <Header>
        <h2>Help & Support Center</h2>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
          <FaRobot style={{ marginRight: '8px' }} /> AI Chat Assistant
        </Tab>
        <Tab active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>
          <FaTicketAlt style={{ marginRight: '8px' }} /> Support Tickets
        </Tab>
      </TabContainer>

      {activeTab === 'chat' ? (
        <ChatWindow>
          <ChatHeader><FaRobot /> BudgetWise Assistant</ChatHeader>
          <MessagesArea>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} isUser={msg.isUser}>
                {msg.text}
              </MessageBubble>
            ))}
            {isLoading && <LoadingDots><span></span><span></span><span></span></LoadingDots>}
            <div ref={messagesEndRef} />
          </MessagesArea>
          <QuickHelpContainer>
            {quickActions.map((action, i) => (
              <QuickActionChip key={i} onClick={() => sendMessage(action)}>
                {action}
              </QuickActionChip>
            ))}
          </QuickHelpContainer>
          <InputArea onSubmit={handleChatSubmit}>
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask anything about BudgetWise..." disabled={isLoading} />
            <SendButton type="submit" disabled={isLoading}><FaPaperPlane /></SendButton>
          </InputArea>
        </ChatWindow>
      ) : (
        <TicketContainer>
          <TicketConfig>
            <FormTitle><FaPlus /> Raise a New Ticket</FormTitle>
            <form onSubmit={handleTicketSubmit}>
              <FormGroup>
                <label>Subject / Issue Type</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., App Crash, Billing Issue" />
              </FormGroup>
              <FormGroup>
                <label>Detailed Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please allow us to help you..." />
              </FormGroup>
              <SubmitButton type="submit" disabled={ticketLoading}>
                {ticketLoading ? 'Submitting...' : 'Submit Ticket'}
              </SubmitButton>
            </form>
          </TicketConfig>
          <HistorySection>
            <FormTitle><FaHistory /> Ticket History</FormTitle>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {tickets.length === 0 ? <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>No tickets found.</p> :
                tickets.map(ticket => (
                  <TicketCard key={ticket.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <strong>{ticket.subject}</strong>
                      <StatusBadge status={ticket.status}>{ticket.status}</StatusBadge>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>{ticket.description.substring(0, 50)}...</p>
                    <small style={{ display: 'block', marginTop: '5px', color: '#999' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </small>
                  </TicketCard>
                ))}
            </div>
          </HistorySection>
        </TicketContainer>
      )}
    </Container>
  );
};

export default HelpDesk;
