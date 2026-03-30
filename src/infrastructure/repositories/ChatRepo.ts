import { injectable } from "inversify";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ChatMessage } from "../../domain/entities/ChatMessage";
import { ChatModel, IChatMessageDoc } from "../models/ChatModel";

interface PopulatedSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
}

@injectable()
export class ChatRepo implements IChatRepo {
  async create(data: Partial<ChatMessage>): Promise<ChatMessage> {
    const msg = await ChatModel.create(data);
    await msg.populate("senderId", "firstName lastName name avatar");

    const entity = this.toEntity(msg);
    const sender = msg.senderId as unknown as PopulatedSender;
    if (sender) {
      entity.senderName = sender.firstName
        ? `${sender.firstName} ${sender.lastName}`
        : sender.name;
      entity.senderAvatar = sender.avatar;
    }
    return entity;
  }

  async countByProjectId(projectId: string): Promise<number> {
    return await ChatModel.countDocuments({ projectId });
  }

  async findByProjectId(
    projectId: string,
    limit = 50,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }> {
    const query: Record<string, unknown> = { projectId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const docs = await ChatModel.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit + 1) // Fetch one extra to check for next page
      .populate("senderId", "firstName lastName name avatar")
      .exec();

    const hasMore = docs.length > limit;
    const messages = hasMore ? docs.slice(0, limit) : docs;

    // Get the cursor from the last item
    const nextCursor =
      hasMore && messages.length > 0
        ? messages[messages.length - 1].createdAt.toISOString()
        : null;

    const entities = messages
      .map((doc) => {
        const entity = this.toEntity(doc);
        const sender = doc.senderId as unknown as PopulatedSender;
        if (sender) {
          entity.senderName = sender.firstName
            ? `${sender.firstName} ${sender.lastName}`
            : sender.name;
          entity.senderAvatar = sender.avatar;
        }
        return entity;
      })
      .reverse(); // Return oldest first for chat view logic (append to top)

    return { messages: entities, nextCursor };
  }

  private toEntity(doc: IChatMessageDoc): ChatMessage {
    // Handle senderId being either a string/ObjectId or a populated object
    const sender = doc.senderId as unknown as PopulatedSender | string;
    let senderIdStr: string;

    if (typeof sender === "object" && sender !== null && "_id" in sender) {
      senderIdStr = sender._id.toString();
    } else {
      senderIdStr = sender.toString();
    }

    return new ChatMessage(
      doc._id.toString(),
      doc.projectId.toString(),
      senderIdStr,
      doc.content,
      doc.type,
      doc.fileUrl,
      doc.createdAt,
    );
  }

  async findById(id: string): Promise<ChatMessage | null> {
    const doc = await ChatModel.findById(id).populate(
      "senderId",
      "firstName lastName name",
    );
    if (!doc) return null;

    const entity = this.toEntity(doc);
    const sender = doc.senderId as unknown as PopulatedSender;
    if (sender) {
      entity.senderName = sender.firstName
        ? `${sender.firstName} ${sender.lastName}`
        : sender.name;
      entity.senderAvatar = sender.avatar;
    }
    return entity;
  }

  async updateMessage(
    id: string,
    content: string,
  ): Promise<ChatMessage | null> {
    const doc = await ChatModel.findByIdAndUpdate(
      id,
      { content },
      { new: true },
    ).populate("senderId", "firstName lastName name");
    if (!doc) return null;

    const entity = this.toEntity(doc);
    const sender = doc.senderId as unknown as PopulatedSender;
    if (sender) {
      entity.senderName = sender.firstName
        ? `${sender.firstName} ${sender.lastName}`
        : sender.name;
    }
    return entity;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await ChatModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByProject(projectId: string): Promise<boolean> {
    const result = await ChatModel.deleteMany({ projectId });
    return result.acknowledged;
  }
}
