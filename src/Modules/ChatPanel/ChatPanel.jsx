import LiquidGlassDiv from "../../Components/LiquidGlassDiv.jsx";
import { UserMessage, AgentMessage } from "./ChatBubble.jsx";
import UserInputArea from "./UserInputArea.jsx";

const mock_data = [
    { id: 1, user: "You", text: "Can you help me analyze the meeting transcript?" },
    { id: 2, user: "AI", text: "Of course! I can help you extract key points, action items, and create summaries from your meeting transcript." },
    { id: 3, user: "You", text: "What are the main topics discussed?" },
    { id: 4, user: "AI", text: "Based on the transcript, the main topics include project timeline, budget allocation, team responsibilities, and upcoming milestones." },
    { id: 5, user: "You", text: "Can you create action items?" },
    { id: 6, user: "AI", text: "Sure! I'll extract actionable tasks with assigned owners and deadlines from the discussion." }
];

export default function ChatPanel() {

    return <LiquidGlassDiv blurriness={0.75} isButton={false} variant="chat">
        <div className="chat-panel-container">
            <div className="chat-history">
                {mock_data.map(message => (
                    message.user === 'You'
                        ? <UserMessage key={message.id} text={message.text} />
                        : <AgentMessage key={message.id} text={message.text} />
                ))}
            </div>

            <UserInputArea />
        </div>
    </LiquidGlassDiv>

}