// First define your interfaces
export interface PolicySection {
    title?: string;
    content?: string;
    intro?: string;
    listItems?: string[];
    conclusion?: string;
    effectiveDate?: string
    paragraphs?: string[];
}

export interface PolicyContent {
    heroTitle: string;
    mainTitle?: string;
    highlightText?: string;
    effectiveDate?: string;
    sections: PolicySection[];
}

export const policyData = {
    "cancellation-policy": {
        "heroTitle": "Cancellation Policy",
        "mainTitle": "Cancellation, Reschedule, and Refund Policy",
        "highlightText": "Dental Healthcare - Cancellation Policy",
        "effectiveDate": "May 1st, 2025",
        "sections": [
            {
                "title": "",
                "paragraphs": [
                    "At Dental, we strive to offer a flexible and client-centered experience while maintaining the integrity of our appointment system. The following policy outlines our guidelines for session rescheduling, cancellations, and refunds."
                ]
            },
            {
                "title": "Session Structure",
                "listItems": [
                    "Standard psychotherapy sessions are 45 minutes long but the session timing may vary based on the service you opt for.",
                    "Any request to alter the session duration must be discussed and agreed upon with your therapist in advance.",
                    "Please arrive on time for your scheduled session. If you are late, the session will still end at the scheduled time and will be billed in full."
                ]
            },
            {
                "title": "Rescheduling request by Client",
                "listItems": [
                    "Free Reschedule: If you request to reschedule at least 24 hours in advance of your scheduled session, you may do so without any additional charge.",
                    "Within 24 Hours: Rescheduling requests made within 24 hours of the session will be treated as a late cancellation, and the session will be billed as usual. A new appointment must be booked separately."
                ]
            },
            {
                "title": "Cancellation by the Client",
                "listItems": [
                    "24 Hours or more in Advance: You may cancel your session and choose one of the following: Rebook another session immediately/ Request a full refund to your original payment method (please email us at support@Dentalhealth.com).",
                    "Within 24 Hours: No refund or credit will be issued for sessions cancelled within 24 hours of the appointment. The session will be billed in full."
                ]
            },
            {
                "title": "Cancellation by Dental",
                "listItems": [
                    "If a therapist cancels your session for any reason, you will receive a full refund/reschedule a session. You may request a refund by contacting support@Dentalhealth.com.",
                    "If your session is disrupted or incomplete due to technical issues or unforeseen circumstances on Dental's end, please email us at support@Dentalhealth.com. Refunds or reschedules in such cases will be handled on a case-by-case basis."
                ]
            },
            {
                "title": "Exceptions to Cancellation Charges",
                "content": "You will not be charged for a missed session if:",
                "listItems": [
                    "Attending the session would put your safety at risk (e.g., severe weather conditions).",
                    "You are dealing with a sudden medical emergency or are caring for a sick family member.",
                    "Please inform us via email or call as soon as possible in such cases."
                ],
                "conclusion": "Note: Exceptions are allowed at your therapist discretion and credits will be provided after confirmation from your therapist"
            }
        ]
    },
    "privacy-policy": {
        "heroTitle": "Privacy Policy",
        "mainTitle": "",
        "effectiveDate": "May 7th, 2025",
        "highlightText": "Dental Healthcare - Privacy Policy",
        "sections": [
            {
                "title": "",
                "paragraphs": [
                    "Dental Healthcare (\"Dental\", \"we\", \"us\" or \"our\") is committed to respecting your privacy and maintaining the confidentiality of your personal and health information. This Privacy Policy outlines how we collect, use, disclose, and protect your information when you use our services, both offline at our clinics and online through our website and associated platforms.",
                    "Please read this policy carefully. By using our services or providing information, you consent to the practices described here. If any term of this Policy is not acceptable to you, please refrain from using Dental's services or platform."
                ]
            },
            {
                "title": "1. Definitions",
                "content": "For clarity in this Privacy Policy:",
                "listItems": [
                    "\"User\", \"client\", \"your\" or \"you\" refers to the individual who uses our Services or Platform. This can include clients (patients), their parent/guardian (in case of minors), or other users accessing our Platform.",
                    "\"Platform\" refers to our website, online appointment system (including third-party systems like Therasoft), mobile applications, or any digital tools we use to provide our Services.",
                    "\"Therapist\" or \"Clinician\" refers to a mental health professional (such as a psychologist, counselor, therapist, psychiatrist, social worker or other expert) who provides services to clients through Dental. These may be Dental's in-house clinicians or associated practitioners."
                ]
            },
            {
                "title": "2. Information We Collect",
                "content": "Personal and Health Information: To provide our Services, Dental collects various types of personal information from you. This may include, but is not limited to:",
                "listItems": [
                    "Contact Details: Your full name, phone number, email address, postal address, and similar contact information. We also collect an emergency contact number (and the name/relation of that contact), which is mandatory for all clients as part of our safety protocol. If you are a teen client, we collect your parent or legal guardian's contact information as well.",
                    "Demographic Information: Age, date of birth, gender, occupation, and general demographic details you provide.",
                    "Medical and Mental Health Information: Your mental health history, medical records relevant to treatment, psychological assessment results, past or current diagnoses, therapy session notes, and any information you share during sessions or on intake forms (e.g. presenting concerns, symptoms, lifestyle information, etc.). Mental health information and medical records are classified as sensitive personal data under Indian law, and we handle them with the highest degree of care and confidentiality.",
                    "Session Data: Details about your appointments (dates of sessions, therapist assigned, attendance status), feedback or notes from therapists, and reasons you may provide for rescheduling or cancelling an appointment.",
                    "Platform Usage Data: If you use our website or online platform, we may collect technical information such as your IP address, device type, browser type, access times, and referring website. We also use cookies or similar technologies to collect usage data to improve our website and services (please refer to our Cookie Policy, if any, for more details).",
                    "Communication Data: Any correspondence with us, such as emails, phone calls, chat messages, or queries. For example, if you communicate via email or call our support, we may keep a record of that communication and any personal details you provide within it.",
                    "Automatic Collection: In line with common web practices, when you use our online Platform, some information is collected automatically. For instance, we may use analytics tools to gather \"Non-Personal Information\" such as anonymized usage statistics, page visit counts, device identifiers, etc., which cannot directly identify you. This information helps us understand user engagement and improve our Services, and it does not reveal your identity."
                ],
                "conclusion": "We collect only that information which is necessary for the purposes described in this Policy. You always have the option not to provide certain information, but doing so may limit your ability to fully avail our Services. We follow the principle of data minimization – we ask only for data that we truly need to serve you effectively."
            },
            {
                "title": "3. Consent",
                "content": "The following sections outline the consent process and important information you need to understand before engaging in psychotherapy services:",
                "listItems": [
                    "Services Risks and Benefits: Psychotherapy can have benefits and risks involved. Generally, it is a safe treatment and does not involve the use of any equipment or devices that may cause any physical or mental harm. However, during therapy, you may remember some unpleasant memories, feel unfamiliar sensations, or experience overwhelming emotions like sadness, anxiety, frustration, anger and loneliness. On the other hand, psychotherapy has also been shown to have benefits for people who go through it. Therapy often leads to better relationships, solutions to specific problems, and significant reductions in feelings of distress. The scientific knowledge about how therapy works is still evolving and over the years we have come to know a lot about the benefits and risks involved. Despite that, there is always a possibility that you will experience new things during the therapy that in no way we can anticipate beforehand. Additionally, it is important to understand that the outcome of therapy depends on various factors, such as the right fit between you and your therapist, the severity of adverse life experiences, and your motivation to work towards treatment goals set during the therapy. However, your therapist will have an ethical responsibility to help you handle the risks safely and experience some benefits from the treatment.",
                    "Responsibilities of the Client: Your commitment to therapy is crucial for success in therapy. The client must make every effort to prioritize therapy to achieve maximum effects/benefits of psychotherapeutic treatments. It is important that you actively participate, express yourself freely and be honest with your therapist. Your most important responsibility is to work toward the goals you and your therapist have agreed upon. To accomplish these goals, most often the tasks or homework assigned by your therapist in the sessions are an integral part of the treatment through which desired changes in your condition(s) can be achieved. You must take personal responsibility to complete these assigned tasks or homework, as prescribed. It is also your responsibility to tell your therapist when you are uncomfortable with any parts of the treatment. If you have any questions, please ask and the therapist will do their best to answer your questions in full.",
                    "Confidentiality: The psychotherapy sessions are strictly confidential. The in-person psychotherapy sessions will take place at the psychotherapist's outpatient clinic and online sessions will be done via tele-communication technologies. Your psychotherapist will not share the proceedings of this consultation with any other individual or agency. However, only with your consent, the sessions could be written in the form of handwritten notes or audio notes. The audio will be immediately discarded after session notes are created from it. The notes can also be used to have their work supervised or for training of professionals or sharing with the client. Apart from this, the details of the consultation would be shared with other health care providers to make referrals and with a court of law, if mandated. You can be assured that the proceedings of these consultations are not to be shared or disseminated by us or to any third person or through social media unless the client gives prior written consent to do so.",
                    "Limits to Confidentiality: While all measures are taken to preserve the confidentiality of the client, however, there are few exceptions to the rule of confidentiality of the client. The therapist would be legally and ethically bound to break the confidentiality clause under the circumstances of risk of serious harm to the client or others, such as: Active suicidal intent or attempts, Abuse in any form to a child or an adult, Homicidal risk, Risk of transmission of HIV/AIDS, Any other instance where the therapist, based on their clinical discretion, believes it is their duty to disclose. On encountering such sensitive information(s), your therapist is obligated to warn the person in danger and to contact any person in a position to prevent harm to you or another person, including law enforcement and medical personnel. These conditions are applicable as long as you are in psychotherapy treatment with your therapist. By signing the consent form, you acknowledge that you have the right to refuse or revoke your consent at any point of time in the therapy process.",
                    "Telephone Accessibility: If you need to contact a therapist between sessions, please leave a message using mytherapist portal. The therapist is often not immediately available; however, they attempt to reach back within 24 hours. Please note that Face-to-face sessions are highly preferable to phone sessions. If a true emergency situation arises, please call 112 or reach out to local emergency services.",
                    "Electronic Communication: We cannot ensure the confidentiality of any form of communication through electronic media, including text messages. If you prefer to communicate via email or text messaging for issues regarding scheduling or cancellations, the practice manager will do so. We request that you do not use these methods of communication to discuss therapeutic content and/or request assistance for emergencies.",
                    "Rights to Privacy and Record Keeping: Notes of the psychotherapy consultation will be maintained by your therapist and stored in a safe location. Under the Mental Health Care Act of 2017, you have the right to access a copy of your psychotherapy notes at any time. The session notes can be made available to you, or shared with any other health care provider in the standard session record format, at only your written request.",
                    "Social Media: Accepting requests from clients on social media platforms such as Facebook, Instagram or others for personal and professional purposes amounts to breach of privacy and confidentiality rules on the therapist's part. Your therapist cannot connect with you on social media since he/she is ethically obligated to protect your privacy.",
                    " Consent For Minors: If you are a minor, you need to understand the following about the things psychotherapy entails: When a person is feeling upset, or having some difficulties and wants to find ways that can help them feel better, think differently and do well, one way to help themselves is called 'Psychotherapy'. You will have a separate 'mind-doctor' or 'feelings- doctor' called a 'psychotherapist'. Your psychotherapist will first try to understand your difficulties as well as possible. Then, in discussion with you and your parents, make an agreement about what difficulties to work on. The agreement will also decide on when, for how long and how often you will need to fix a time to discuss. Your parents may be legally entitled to some information about your therapy. We will discuss with you and your parents what information is appropriate for them to receive and which issues are more appropriately kept confidential. For different reasons, you and your psychotherapist could talk to each other at the clinic or using a phone/a computer. Your parent/ guardian will be asked for their permission for this. When and how long you would talk would be discussed in advance with you and your parents, each time. In some sessions, the therapist may talk to your parent/s or both you and your parent/s together in order to help you. Nobody - neither you, your parents or your doctor/psychotherapist - will take photographs or record anything while you and your psychotherapist are talking. No information about these talks will be shared with anyone else. Sometimes, your psychotherapist may share information about your discussions with their supervisor/teacher. Sometimes, if you are too upset, talking either in-person at a clinic or over phone/computer would not be possible or helpful enough. In such situations, you may need to go to a hospital for urgent help and your parents will be guided about the closest suitable places where they can take you to.",
                    " Termination: Ending relationships can be difficult. Therefore, it is important to have a termination process in order to achieve some closure. The appropriate length of the termination depends on the length and intensity of the treatment. Therapists may terminate treatment after appropriate discussion with you and a termination process if they determine that the psychotherapy is not being effectively used or if you are in default on payment. The therapists will not terminate the therapeutic relationship without first discussing and exploring the reasons and purpose of terminating. If therapy is terminated for any reason or you request another therapist, the therapist will provide you with a list of qualified providers to treat you. You may also choose someone on your own or from another referral source.",
                    " Consent to Engage in Consultation: You consent to engage in psychotherapy after careful consideration and understanding of the risks and benefits involved. You understand your rights to privacy and the limits to confidentiality. You understand your responsibilities as a client during the therapy and your therapist's responsibility towards you. You know that you are free to refuse requests by your therapist or terminate therapy at any time and do not require your therapist's permission to do so. Therefore, you agree to undertake psychotherapy with a therapist at Dental Healthcare."
                ]
            },
            {
                "title": "4. Data Sharing and Disclosure to Third Parties",
                "content": "Dental Healthcare will not sell, rent, or trade your personal information to any third party for their own marketing or other uses. We only share your data in the following contexts, each of which is governed by strict controls and, where required, your consent:",
                "listItems": [
                    "Within Dental and Affiliated Service Providers: Your information may be shared internally among authorized Dental personnel (therapists, psychologists, psychiatrists if any on our team, clinical supervisors, and administrative staff) who need the information to provide services to you. All such personnel are bound by confidentiality and data protection obligations as described in Section 3. If Dental Healthcare works with partner professionals or consultants (for example, an external clinical supervisor or a specialist doctor consulting on a case), they would only receive information to the extent necessary and are required to adhere to our privacy standards by contractual agreement.",
                    "Therasoft and Technological Partners: We use the Therasoft online platform for appointment scheduling and practice management. When you book an appointment or use our online portal, some of your personal data (such as name, contact, and appointment details) will be stored on Therasoft's systems. Therasoft serves as a data processor on our behalf for these functions. We have an agreement in place with Therasoft to ensure your data is protected and used only for managing our appointments. Therasoft is obligated to implement security measures and comply with applicable data protection laws. Similarly, if we use other third-party software or hosting services (for example, secure cloud storage or video conferencing tools for teletherapy), those providers may handle your data to the extent necessary for providing their service to us. We take care to choose reputable providers who employ strong security and confidentiality commitments. We do not permit our third-party vendors to use your data for anything other than providing services to Dental.",
                    "Referrals and External Healthcare Providers: If we refer you to another mental health professional or a healthcare institution (or if we coordinate with one, like your psychiatrist or a laboratory for tests), we will share your relevant personal information with them only with your consent (except in emergency exceptions as noted in Section 3). For example, if your therapist believes you might benefit from a psychiatric evaluation, we would discuss this with you and, with your permission, forward a summary or referral note to a psychiatrist including pertinent information like diagnosis or medications tried. The external provider to whom information is disclosed will be responsible for that information under their own privacy policy, but we will advise them of the need to handle it confidentially. In any case, we share the minimum necessary information required for the purpose."
                ],
                "conclusion": "It's also important to note, when you yourself use certain features on our Platform (for example, posting a comment on an online forum or interacting with Dental's social media), any information you publicly disclose can be seen by others. This Privacy Policy's restrictions apply to information you entrust to us directly – we are not responsible for what you choose to make public on forums not controlled by us. We strongly advise users not to post personal or health information in any public forums associated with us, to avoid inadvertent disclosure."
            },
            {
                "title": "5. Data Security Measures",
                "paragraphs": [
                    "Dental takes the security of your personal data very seriously. We implement administrative, physical, and technical safeguards to protect against unauthorized access, alteration, disclosure, or destruction of your information.",
                    "Despite all our efforts, it is important to note that no method of data transmission or storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee absolute security. This is a standard caveat in all privacy policies because unforeseen breaches or zero-day attacks can occur.",
                    "Your Responsibilities for Data Security: We also request you to play a role in keeping your data safe. Please use strong passwords for any online account with Dental (if applicable) and do not share your account credentials or OTPs with anyone. Be cautious about phishing – Dental will never ask for your password via phone or email. Ensure the devices you use to access our services are secure. If you suspect any unauthorized access to your account or a potential security issue (such as you lost your phone which had our app logged in), please inform us immediately on support@Dentalhealth.com , so we can take protective measures. We provide therapy-related communications (like appointment reminders) via phone/email – you are responsible for securing access to your phone, SMS, and email. We cannot be liable if someone else accesses your email or phone and thus gains information about your appointments​."
                ]
            },
            {
                "title": "6. Grievance Redressal",
                // "content": "Dental Healthcare has designated a Grievance Officer to address any user grievances. If you have any complaints, queries, or issues regarding your privacy or how we handled your data, you may contact:",
                "paragraphs": [
                    "Dental Healthcare has designated a Grievance Officer to address any user grievances. If you have any complaints, queries, or issues regarding your privacy or how we handled your data, you may contact:",
                    "Grievance Officer: Nikita Bhati",
                    "Email: support@Dentalhealth.com",
                    "We encourage you to reach out with any concerns – whether it's about accessing your records, withdrawing consent, reporting a suspected breach, or any perceived violation of your privacy rights. When you contact us, please provide the relevant details of your issue and any supporting information so we can address it promptly.",

                ],
                "conclusion": "Redressal Mechanism: Upon receiving a grievance, our Grievance Officer will acknowledge it and initiate an investigation. We commit to resolving grievances in a time-bound manner, not exceeding 30 days from the date of receipt of the complaint."
            },
            {
                "title": "7. Changes to this Privacy Policy",
                "paragraphs": [
                    "We may update or revise this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or for other operational reasons. If we make significant changes, we will notify users in an appropriate manner, such as by posting a prominent notice on our website or sending an email notification, prior to the change becoming effective. We encourage you to periodically review this page for the latest information on our privacy practices.",
                    "Your continued use of our Services after any changes to the Privacy Policy indicates your acknowledgement of the changes and consent to the updated terms. If you do not agree with the modified terms, you must discontinue use of Dental's services and platform, and you may request us to delete or return your data."
                ]
            },
            {
                "title": "8. Governing Law and Jurisdiction",
                "paragraphs": [
                    "This Privacy Policy and any disputes arising from it or from your use of our Services are governed by the laws of India. In the event of any dispute or claim relating to this Privacy Policy, the matter shall be subject to the exclusive jurisdiction of the courts at Gautam Buddh Nagar, Noida (UP), India."
                ]
            },
            {
                "title": "9 Contact Us",
                "listItems": [
                    "Email: support@Dentalhealth.com",
                    "Phone: +91 9899 129943",
                    "Postal Address: Dental - Dental, 2nd Floor, LC complex Sector 49, near metro station, Sector 76, Noida, Uttar Pradesh 201301"
                ]
            }
        ]
    }

} satisfies Record<string, PolicyContent>;