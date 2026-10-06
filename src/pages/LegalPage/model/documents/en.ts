import { MIN_USER_AGE, OPERATOR } from '@/shared/const/legal';
import { LegalDocuments } from '../types';

/**
 * Legal documents — English translation for convenience. The Russian version (ru.ts) prevails.
 * Keep in sync with ru.ts: same sections, same facts.
 */

const operator = `Individual Entrepreneur Andrey Yuryevich Chipizubov (INN ${OPERATOR.inn}, OGRNIP ${OPERATOR.ogrnip})`;
const site = OPERATOR.site;
const email = OPERATOR.email;
const translationNote = 'This is a translation provided for convenience. In case of any discrepancy, the Russian version prevails.';

export const EN_DOCUMENTS: LegalDocuments = {
    terms: {
        title: 'Terms of Use',
        intro: [
            translationNote,
            `These Terms of Use (the "Terms") govern the use of the Zubrika service available at ${site}, including via the Telegram Mini App (the "Service"). The Service is provided by ${operator} (the "Owner").`,
            'The Terms are a public offer (Art. 437 of the Civil Code of the Russian Federation). The offer is accepted by registering in the Service and ticking the box accepting the Terms, or by accepting the Terms in the window the Service shows after sign-in.',
        ],
        sections: [
            {
                id: 'subject',
                title: '1. Subject',
                blocks: [
                    '1.1. The Owner provides the User with free access to the Service for learning English: creating flashcard decks with words and phrases, studying in learning modes, spaced repetition, grammar exercises, statistics and AI features within limits.',
                    '1.2. The Service is free of charge. If paid features appear in the future, their terms will be published separately, and payment will only be required with the User\'s explicit consent.',
                    '1.3. Processing of the User\'s personal data is governed by the Personal Data Processing Policy ("Privacy" on the Site) and the Consent to Personal Data Processing, which are separate documents.',
                ],
            },
            {
                id: 'account',
                title: '2. Registration and account',
                blocks: [
                    `2.1. The Service may be used by persons aged ${MIN_USER_AGE} or older. By registering, the User confirms that they are at least ${MIN_USER_AGE}. Persons under ${MIN_USER_AGE} may not register.`,
                    '2.2. Registration requires an email address and a password; a name is optional. When signing in via Telegram, the account is created from data provided by Telegram.',
                    '2.3. The User undertakes to provide a valid email address, not to share account access with third parties and to keep the password secret. Actions taken in the account are deemed the User\'s until the User reports unauthorized access to the Owner.',
                    '2.4. The User may delete the account at any time under "Settings". Deletion is irreversible: decks, cards, progress and statistics are deleted permanently. Decks the User shared stop being available to other users.',
                ],
            },
            {
                id: 'content',
                title: '3. User content',
                blocks: [
                    '3.1. Decks, cards, examples and other materials the User adds to the Service ("Materials") belong to the User.',
                    '3.2. The User grants the Owner a free, non-exclusive right to store, process and display the Materials to the extent needed to operate the Service: to show them to the User and to shared-deck members and to send them to the AI service at the User\'s request. The right lasts while the Materials are stored in the Service.',
                    '3.3. The User does not post Materials that violate the laws of the Russian Federation or the rights of third parties, or personal data of other people without their consent.',
                    '3.4. By sharing a deck with another user, the User understands that this user will see the deck content and the deck owner\'s name and email address, and, if editing is allowed, will be able to change the cards.',
                ],
            },
            {
                id: 'ai',
                title: '4. AI features',
                blocks: [
                    '4.1. Translation checking, phrase suggestions and AI grammar exercises are performed by a third-party artificial intelligence service. These features run only on the User\'s action and are limited by a daily request quota shown in the Service.',
                    '4.2. AI responses are generated automatically and may contain errors. The User decides whether to accept suggested changes.',
                ],
            },
            {
                id: 'rules',
                title: '5. Acceptable use',
                blocks: [
                    'The User may not:',
                    {
                        list: [
                            'use the Service for actions that violate the laws of the Russian Federation;',
                            'try to access other users\' accounts and data or bypass the Service\'s restrictions and limits;',
                            'create load that disrupts the Service, including by automated requests;',
                            'distribute materials infringing the rights of others through shared decks.',
                        ],
                    },
                ],
            },
            {
                id: 'owner-rights',
                title: '6. Owner\'s rights and obligations',
                blocks: [
                    '6.1. The Owner operates the Service, protects the User\'s data in accordance with the Personal Data Processing Policy and responds to the User\'s requests.',
                    '6.2. The Owner may develop the Service, change and add features and carry out maintenance. The Owner tries to announce long planned maintenance in advance.',
                    '6.3. If the User breaches the Terms, the Owner may restrict or block access to the account. The User may appeal by writing to the Owner; if there was no breach, access is restored.',
                    '6.4. To resolve technical problems at the User\'s request and to investigate violations, a Service administrator may access the account. Every such access is recorded in the administrator action log.',
                ],
            },
            {
                id: 'liability',
                title: '7. Liability',
                blocks: [
                    '7.1. The Service is provided free of charge on an "as is" basis. The Owner makes reasonable efforts to keep it running but does not guarantee the absence of errors and interruptions.',
                    '7.2. The Owner is not liable for interruptions caused by force majeure, failures of third-party services and networks, or for consequences of the User giving third parties access to their account.',
                    '7.3. Limitations of liability apply to the extent permitted by the laws of the Russian Federation, including consumer protection law, and do not limit the User\'s rights that cannot be limited by contract.',
                    '7.4. The User is advised to keep important decks by exporting them to Excel, JSON or Markdown.',
                ],
            },
            {
                id: 'changes',
                title: '8. Changes to the Terms',
                blocks: [
                    '8.1. The Owner may change the Terms. The new version is published on the Site with its date.',
                    '8.2. The Owner notifies the User of material changes in the Service at least 7 days before they take effect and asks the User to accept the new version. If the User disagrees, they may stop using the Service and delete the account.',
                ],
            },
            {
                id: 'disputes',
                title: '9. Disputes and governing law',
                blocks: [
                    '9.1. The Terms are governed by the laws of the Russian Federation.',
                    `9.2. The parties try to settle disputes out of court: the User sends a claim to ${email}, and the Owner responds within 30 days. Unresolved disputes are heard by a court in accordance with the laws of the Russian Federation, including the jurisdiction rules established to protect consumers.`,
                ],
            },
            {
                id: 'contacts',
                title: '10. Details and contacts',
                blocks: [
                    `${operator}.`,
                    `Email for requests: ${email}.`,
                ],
            },
        ],
    },

    privacy: {
        title: 'Personal Data Processing Policy',
        intro: [
            translationNote,
            `This Policy explains which personal data ${operator} (the "Operator") processes when operating the Zubrika service (${site}, including the Telegram Mini App; the "Service"), why, for how long, to whom it is transferred and how the user can manage their data.`,
            'The Policy is drawn up in accordance with Federal Law No. 152-FZ of 27.07.2006 "On Personal Data" and is published for unrestricted access.',
        ],
        sections: [
            {
                id: 'terms',
                title: '1. Definitions',
                blocks: [
                    'Personal data — any information relating directly or indirectly to an identified or identifiable individual.',
                    'Processing — any operation on personal data: collection, recording, systematization, accumulation, storage, clarification, retrieval, use, transfer (provision, access), depersonalization, blocking, deletion, destruction.',
                    'User — an individual registered in the Service.',
                    'Processor — a person processing personal data on behalf of the Operator.',
                ],
            },
            {
                id: 'data',
                title: '2. Data we process',
                blocks: [
                    'Account data (required for the Service to work):',
                    {
                        list: [
                            'email address;',
                            'password — stored only as a cryptographic hash, the Operator does not know it;',
                            'name — if the User provided it;',
                            'when signing in via Telegram — Telegram user ID and username.',
                        ],
                    },
                    'Profile data (optional): surname, patronymic, phone number, time zone, "About me" text, an avatar chosen from a preset set.',
                    'Learning data: decks, cards (words, translations, examples), favorites, spaced repetition progress, answer history (correctness, mode, duration, time), learning cycles, grammar exercise results, daily goal and settings, AI request counter.',
                    'Consent data: which document, which version and when it was accepted.',
                    'Technical data: IP address, browser and device information, request time — recorded in infrastructure server logs; session identifier in browser storage.',
                    'The Operator does not process special categories of personal data (racial or ethnic origin, political views, religious beliefs, health, intimate life) or biometric data. The User should not put such information into cards or the profile.',
                ],
            },
            {
                id: 'purposes',
                title: '3. Purposes and legal grounds',
                blocks: [
                    {
                        list: [
                            'Registration, sign-in, access recovery, service emails — account data; grounds: performance of the Terms of Use and the User\'s consent.',
                            'Learning features: storing decks and progress, spaced repetition, statistics — learning data; grounds: performance of the Terms of Use.',
                            'Shared decks: showing deck members the owner\'s and guests\' name and email — grounds: the action of the User who shared the deck, and consent.',
                            'AI features at the User\'s request: sending card text and exercise answers to the AI service — grounds: the User\'s consent.',
                            'Auto-translation when adding words: sending the typed word to the translation service — grounds: the User\'s consent.',
                            'Security and support: abuse prevention, limits, handling requests and technical errors, administrator action log — grounds: performance of the Terms and the Operator\'s legitimate interest in running the Service securely.',
                            'Proof of consents received — grounds: the Operator\'s obligation under 152-FZ.',
                        ],
                    },
                    'The Operator does not use personal data for advertising or marketing emails, does not sell it, and does not make decisions producing legal effects for the User based solely on automated processing.',
                ],
            },
            {
                id: 'recipients',
                title: '4. Who receives the data',
                blocks: [
                    'The Operator engages processors and gives them only the data needed for their function:',
                    {
                        list: [
                            'Supabase, Inc. (USA) — database hosting, authentication, server functions, service emails. Processes all data listed in section 2.',
                            'OpenAI, L.L.C. (USA) — processing of AI feature requests. Only the words, translations and examples of selected cards and grammar exercise answers are sent, without email address or name. Data is sent only when the User presses an AI button.',
                            'Translated S.r.l. (Italy), MyMemory service — automatic translation of typed words. The typed word is sent; since the request is made from the browser, the service also receives the IP address and browser information.',
                            'Telegram (Telegram Messenger Inc. and affiliates) — when using the Telegram Mini App: Telegram provides the Service with the user ID and username; use of Telegram is governed by its own rules.',
                            'The website hosting provider — technical request data in web server logs.',
                        ],
                    },
                    'Other users see the User\'s data only in shared decks: the deck owner sees guests\' name and email, guests see the owner\'s name and email. The list of all users and their profiles is not available to other users.',
                    'The Operator discloses data to government authorities only in cases expressly provided for by the laws of the Russian Federation.',
                ],
            },
            {
                id: 'cross-border',
                title: '5. Storage location and cross-border transfer',
                blocks: [
                    '5.1. Service data is stored on Supabase servers located outside the Russian Federation and is transferred to processors in the USA and Italy (section 4). This is a cross-border transfer of personal data, including to countries not on the list of countries providing adequate protection of data subjects\' rights.',
                    '5.2. The cross-border transfer is based on the User\'s consent, given at registration as a separate document — the Consent to Personal Data Processing — and only to the extent necessary for the purposes in section 3.',
                ],
            },
            {
                id: 'retention',
                title: '6. Retention periods',
                blocks: [
                    {
                        list: [
                            'Account, profile, learning and consent data — while the account exists. When the account is deleted, the data is removed from the database immediately and from the provider\'s backups within their retention period, but no later than 30 days.',
                            'If consent is withdrawn, processing stops and the data is destroyed within 30 days of receiving the withdrawal, unless the law provides otherwise.',
                            'Administrator action log — 1 year; the log stores only account identifiers, without name or email.',
                            'Infrastructure server logs — for the periods set by providers, usually no more than 90 days.',
                            'Correspondence with the User about their requests — until the matter is resolved and no longer than 3 years.',
                        ],
                    },
                ],
            },
            {
                id: 'rights',
                title: '7. User rights',
                blocks: [
                    'The User has the right to:',
                    {
                        list: [
                            'obtain information about the processing of their personal data;',
                            'demand clarification, blocking or destruction of data that is incomplete, outdated, inaccurate, unlawfully obtained or not needed for the stated purpose;',
                            'withdraw consent to personal data processing;',
                            'appeal the Operator\'s actions to Roskomnadzor or to a court.',
                        ],
                    },
                    'Without contacting the Operator, the User can: change or delete profile data under "Profile", export decks to Excel, JSON or Markdown, delete decks and cards, and delete the account with all data under "Settings".',
                    `Requests are sent to ${email} from the email address of the account. The Operator responds within 10 business days of receipt; the period may be extended by no more than 5 business days with an explanation.`,
                ],
            },
            {
                id: 'withdrawal',
                title: '8. Withdrawing consent',
                blocks: [
                    `Consent is withdrawn by deleting the account under "Settings" or by writing to ${email}. After withdrawal, the Operator stops processing and destroys the data within the periods in section 6. The Service cannot be used without consent to personal data processing.`,
                ],
            },
            {
                id: 'security',
                title: '9. How we protect data',
                blocks: [
                    {
                        list: [
                            'Data between the browser and servers is encrypted (HTTPS).',
                            'Passwords are stored as hashes.',
                            'Database-level access rules: each user reads and changes only their own data; shared-deck data is available only to its members.',
                            'Administrative access is restricted, and administrator actions on other accounts (signing in to an account, blocking, changing role and limits, deletion) are logged.',
                            'Email, name and other profile data are not sent to the AI service.',
                            'Secret service keys are stored only on the server and are not included in the website code.',
                        ],
                    },
                    'In the event of a personal data breach, the Operator notifies Roskomnadzor within the periods set by 152-FZ and informs the affected users.',
                ],
            },
            {
                id: 'storage',
                title: '10. Cookies and browser storage',
                blocks: [
                    'The Service does not use cookies or counters for analytics or advertising. Browser storage (localStorage) holds only data needed for the Service to work: session tokens for sign-in, interface settings (theme, language, voice, menu state), unfinished study sessions and answers not yet sent, and the list of recent decks. This data stays on the device and is deleted when the User signs out or clears site data in the browser.',
                ],
            },
            {
                id: 'minors',
                title: '11. Minors',
                blocks: [
                    `The Service is intended for persons aged ${MIN_USER_AGE} and over. If the Operator learns that an account was created by a person under ${MIN_USER_AGE}, the account and data will be deleted. A legal representative may send such a request to ${email}.`,
                ],
            },
            {
                id: 'changes',
                title: '12. Changes to the Policy',
                blocks: [
                    'The Operator may change the Policy. The new version is published on the Site with its date. If the changes concern the data, purposes or recipients, the Service will ask the User to accept the documents again.',
                ],
            },
            {
                id: 'operator',
                title: '13. Operator details',
                blocks: [
                    `${operator}.`,
                    `Email for personal data matters: ${email}.`,
                ],
            },
        ],
    },

    consent: {
        title: 'Consent to Personal Data Processing',
        intro: [
            translationNote,
            `By registering in the Zubrika service (${site}, including via the Telegram Mini App) or confirming consent in the Service window, I freely, of my own will and in my own interest, give consent to ${operator} (the "Operator") to process my personal data on the following terms.`,
        ],
        sections: [
            {
                id: 'data',
                title: '1. Personal data',
                blocks: [
                    'Email address; first name, surname and patronymic (if provided); phone number, time zone, "About me" text, chosen avatar (if provided); Telegram user ID and username (when signing in via Telegram); decks and cards I create; study progress and history; exercise results; settings; AI request counter; information about consents I gave; technical data (IP address, browser and device information, request time).',
                ],
            },
            {
                id: 'purposes',
                title: '2. Purposes',
                blocks: [
                    'Registration and sign-in, access recovery; learning features and statistics; shared decks; AI features and auto-translation at my request; security and support; proof of consents given.',
                ],
            },
            {
                id: 'actions',
                title: '3. Operations',
                blocks: [
                    'Collection, recording, systematization, accumulation, storage, clarification (update, change), retrieval, use, transfer (provision, access), blocking, deletion, destruction; automated processing.',
                ],
            },
            {
                id: 'recipients',
                title: '4. Transfer to third parties, including cross-border',
                blocks: [
                    'I agree to the transfer of data to the Operator\'s processors, including cross-border transfer to countries that do not provide adequate protection of data subjects\' rights:',
                    {
                        list: [
                            'Supabase, Inc. (USA) — data storage, authentication, server functions, service emails: all data listed in section 1;',
                            'OpenAI, L.L.C. (USA) — card texts and exercise answers when using AI features, without email address or name;',
                            'Translated S.r.l. (Italy), MyMemory service — typed words, IP address and browser information for auto-translation.',
                        ],
                    },
                    'I understand that members of shared decks that I share or that are shared with me will see my name and email address.',
                ],
            },
            {
                id: 'term',
                title: '5. Term and withdrawal',
                blocks: [
                    `The consent is valid until the account is deleted or the consent is withdrawn. I may withdraw consent by deleting the account under "Settings" or by writing to ${email}. After withdrawal, the Operator stops processing and destroys my data within 30 days unless the law provides otherwise.`,
                    `I confirm that I am at least ${MIN_USER_AGE} years old and have read the Personal Data Processing Policy.`,
                ],
            },
        ],
    },
};
