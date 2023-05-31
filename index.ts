import express, { Router } from "express";
import { Configuration, OpenAIApi } from "openai";

type OpenAiMessage = {
  role: "user" | "system" | "assistant";
  content: string;
};

const examples = [
  {
    from: "Salesforce",
    to: "Intercom",
    intro:
      "In the world of customer support, swift and efficient responses are crucial to maintaining customer satisfaction. Intercom is a powerful customer communication platform, while Salesforce is a robust customer relationship management (CRM) solution. Combining the capabilities of these two platforms can significantly enhance your customer support efforts. However, transferring data between them can be challenging. That's where Magical comes in. This powerful Chrome extension enables you to effortlessly transfer data from Intercom to Salesforce, helping you reduce response time and optimize your customer support processes. In this blog post, we'll discuss what Magical is, how to install it, and how to use it to transfer data from Intercom to Salesforce for more efficient customer support.",
    attributes: ["First Name", "Account Name", "Email", "Company"],
    steps: [
      "Sign in to your Intercom account and open the conversation containing the data you want to transfer, such as customer information and support details.",
      "Sign in to your Salesforce account and open the record where you want to add the Intercom data.",
      "Click on the Magical extension in your browser's toolbar, and connect it to both your Intercom and Salesforce accounts.",
      "In Intercom, locate the data you want to transfer, like Customer Name, Email Address, or Support Details.",
      'Type "//" in an empty field in Intercom to trigger the Magical extension or click the Magical button in your browser and add the data you want to transfer to Salesforce. Tip: You can search for variable names by typing.',
      "Once you've added all the data, the information will be automatically inserted into your Salesforce record.",
      "Repeat the process for any other Intercom to Salesforce transfers you want to do for your customer support processes."
    ]
  }
];

const getPrompt = (newFrom: string, newTo: string): string => {
  const from = examples[0].from;
  const to = examples[0].to;

  const intro = examples[0].intro;
  const attributes = examples[0].attributes;
  const steps = examples[0].steps;

  const prompt = `
You are generating static pages for a chrome extension's interrogations page, your task is to create content for the page, that are very similar. The examples I give you will be on the ${from} to ${to} page but instead of ${from} and ${to}, focus on ${newFrom} to ${newTo}, try to keep it a similar length as the examples I give you. Please separate each task into a different codeblock with the title of what it is.

First you need to generate the intro paragraph, here is an example:

"${intro}"

Next you will need to generate a list of the data attributes they can transfer, for example on the ${from} to ${to} page there are:

${attributes.map((attribute: string) => `- ${attribute}`).join("\n")}

Finally, you will need to explain to them how they can use Magical to transfer the data from ${newFrom} to ${newTo}, here is the examples for ${from}:

"${steps
    .map((step: string, index: number) => `${index + 1}. ${step}`)
    .join("\n")}"

    When returning the steps do not number them, just return the steps.

Please return these to me in a json object formatted like this:

{
    "intro": "IntroParagraphHere",
    "attributes": [
        "Attribute1",
        "Attribute2",
    ],
    "steps": [
        "Step1",
        "Step2",
    ]
}
`;

  return prompt;
};

export const generateResult = async (from: string, to: string) => {
  const openAi = new OpenAIApi(
    new Configuration({
      apiKey: "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",
      organization: "org-HVhB9ln7ksjyO7xFqkZkIOsa"
    })
  );
  const messages: OpenAiMessage[] = [
    {
      role: "system",
      content: `You are an assistant that responds as short and concisely as possible in plain english.`
    },
    { role: "user", content: getPrompt(from, to) }
  ];

  const response = await openAi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 1000,
    temperature: 0.5
  });

  if (!response || !response.data || !response.data.choices) {
    return null;
  }

  return JSON.parse(response.data.choices[0]?.message?.content);
};

const router = Router();
const app = express();
const port = 3200;

app.get("/generate", async (req, res) => {
  if (!req.query.from || !req.query.to) {
    res.send("Please provide a from and to parameter");
    return;
  }
  const response = await generateResult(
    req.query.from as string,
    req.query.to as string
  );
  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
