/**
 * Message Request and Response
 * ============================
 * */

/**
 * The role of the author of this message.
 */
export enum ChatCompletionRole {
  System = "system",
  Assistant = "assistant",
  User = "user",
}

/**
 * The `MessageRequest` type defines the shape of a new message request object.
 * @data_transfer_object
 */
export type ChatCompletionMessage = {
  /** The contents of the message. **/
  content?: string;
  /** The role of the author of this message. **/
  role: ChatCompletionRole;
};

/**
 * The `MessageRequest` type defines the shape of a new message request object.
 * @data_transfer_object
 */
export type MessageRequest = {
  id?: string;

  /** The thread id of the message request. **/
  threadId: string;

  /**
   * The assistant id of the message request.
   */
  assistantId?: string;

  /** Messages for constructing a chat completion request **/
  messages?: ChatCompletionMessage[];

  /** Runtime parameters for constructing a chat completion request **/
  parameters?: ModelRuntimeParam;
};

/**
 * Thread and Message
 * ========================
 * */

/**
 * The status of the message.
 * @data_transfer_object
 */
export enum MessageStatus {
  /** Message is fully loaded. **/
  Ready = "ready",
  /** Message is not fully loaded. **/
  Pending = "pending",
}
/**
 * The `ThreadMessage` type defines the shape of a thread's message object.
 * @stored
 */
export type ThreadMessage = {
  /** Unique identifier for the message, generated by default using the ULID method. **/
  id: string;
  /** Object name **/
  object: string;
  /** Thread id, default is a ulid. **/
  thread_id: string;
  /** The role of the author of this message. **/
  assistant_id?: string;
  // TODO: comment
  role: ChatCompletionRole;
  /** The content of this message. **/
  content: ThreadContent[];
  /** The status of this message. **/
  status: MessageStatus;
  /** The timestamp indicating when this message was created. Represented in Unix time. **/
  created: number;
  /** The timestamp indicating when this message was updated. Represented in Unix time. **/
  updated: number;
  /** The additional metadata of this message. **/
  metadata?: Record<string, unknown>;
};

/**
 * The content type of the message.
 */
export enum ContentType {
  Text = "text",
  Image = "image",
}
/**
 * The `ThreadContent` type defines the shape of a message's content object
 * @data_transfer_object
 */
export type ThreadContent = {
  type: ContentType;
  text: ContentValue;
};

/**
 * The `ContentValue` type defines the shape of a content value object
 * @data_transfer_object
 */
export type ContentValue = {
  value: string;
  annotations: string[];
};

/**
 * The `Thread` type defines the shape of a thread object.
 * @stored
 */
export interface Thread {
  /** Unique identifier for the thread, generated by default using the ULID method. **/
  id: string;
  /** Object name **/
  object: string;
  /** The title of this thread. **/
  title: string;
  /** Assistants in this thread. **/
  assistants: ThreadAssistantInfo[];
  // if the thread has been init will full assistant info
  isFinishInit: boolean;
  /** The timestamp indicating when this thread was created, represented in ISO 8601 format. **/
  created: number;
  /** The timestamp indicating when this thread was updated, represented in ISO 8601 format. **/
  updated: number;
  /** The additional metadata of this thread. **/
  metadata?: Record<string, unknown>;
}

/**
 * Represents the information about an assistant in a thread.
 * @stored
 */
export type ThreadAssistantInfo = {
  assistant_id: string;
  assistant_name: string;
  model: ModelInfo;
};

/**
 * Represents the information about a model.
 * @stored
 */
export type ModelInfo = {
  id: string;
  settings: ModelSettingParams;
  parameters: ModelRuntimeParam;
};

/**
 * Represents the state of a thread.
 * @stored
 */
export type ThreadState = {
  hasMore: boolean;
  waitingForResponse: boolean;
  error?: Error;
  lastMessage?: string;
};

/**
 * Model type defines the shape of a model object.
 * @stored
 */
export interface Model {
  /**
   * The type of the object.
   * Default: "model"
   */
  object: string;

  /**
   * The version of the model.
   */
  version: string;

  /**
   * The model download source. It can be an external url or a local filepath.
   */
  source_url: string;

  /**
   * The model identifier, which can be referenced in the API endpoints.
   */
  id: string;

  /**
   * Human-readable name that is used for UI.
   */
  name: string;

  /**
   * The organization that owns the model (you!)
   * Default: "you"
   */
  owned_by: string;

  /**
   * The Unix timestamp (in seconds) for when the model was created
   */
  created: number;

  /**
   * Default: "A cool model from Huggingface"
   */
  description: string;

  /**
   * The model state.
   * Default: "to_download"
   * Enum: "to_download" "downloading" "ready" "running"
   */
  state: ModelState;

  /**
   * The model settings.
   */
  settings: ModelSettingParams;

  /**
   * The model runtime parameters.
   */
  parameters: ModelRuntimeParam;

  /**
   * Metadata of the model.
   */
  metadata: ModelMetadata;
}

/**
 * The Model transition states.
 */
export enum ModelState {
  ToDownload = "to_download",
  Downloading = "downloading",
  Ready = "ready",
  Running = "running",
}

/**
 * The available model settings.
 */
export type ModelSettingParams = {
  ctx_len: number;
  ngl: number;
  embedding: boolean;
  n_parallel: number;
};

/**
 * The available model runtime parameters.
 */
export type ModelRuntimeParam = {
  temperature: number;
  token_limit: number;
  top_k: number;
  top_p: number;
  stream: boolean;
};

/**
 * The metadata of the model.
 */
export type ModelMetadata = {
  engine: string;
  quantization: string;
  size: number;
  binaries: string[];
  maxRamRequired: number;
  author: string;
  avatarUrl: string;
};

/**
 * Model type of the presentation object which will be presented to the user
 * @data_transfer_object
 */
export interface ModelCatalog {
  /** The unique id of the model.*/
  id: string;
  /** The name of the model.*/
  name: string;
  /** The avatar url of the model.*/
  avatarUrl: string;
  /** The short description of the model.*/
  shortDescription: string;
  /** The long description of the model.*/
  longDescription: string;
  /** The author name of the model.*/
  author: string;
  /** The version of the model.*/
  version: string;
  /** The origin url of the model repo.*/
  modelUrl: string;
  /** The timestamp indicating when this model was released.*/
  releaseDate: number;
  /** The tags attached to the model description **/
  tags: string[];
  /** The available versions of this model to download. */
  availableVersions: Model[];
}

/**
 * Assistant type defines the shape of an assistant object.
 * @stored
 */
export type Assistant = {
  /** Represents the avatar of the user. */
  avatar: string;
  /** Represents the location of the thread. */
  thread_location: string | undefined;
  /** Represents the unique identifier of the object. */
  id: string;
  /** Represents the object. */
  object: string;
  /** Represents the creation timestamp of the object. */
  created_at: number;
  /** Represents the name of the object. */
  name: string;
  /** Represents the description of the object. */
  description: string;
  /** Represents the model of the object. */
  model: string;
  /** Represents the instructions for the object. */
  instructions: string;
  /** Represents the tools associated with the object. */
  tools: any;
  /** Represents the file identifiers associated with the object. */
  file_ids: string[];
  /** Represents the metadata of the object. */
  metadata?: Record<string, unknown>;
};
