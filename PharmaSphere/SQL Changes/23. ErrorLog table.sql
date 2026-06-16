CREATE TABLE [dbo].[ErrorLog] (
    [ErrorLogId]       INT            IDENTITY(1,1) NOT NULL,
    [ErrorDate]        DATETIME       NULL,
    [LoginID]          INT            NULL,
    [IPAddress]        NVARCHAR(20)   NULL,
    [ClientBrowser]    NVARCHAR(50)   NULL,
    [ErrorMessage]     NVARCHAR(MAX)  NULL,
    [ErrorStackTrace]  NVARCHAR(MAX)  NULL,
    [URL]              NVARCHAR(MAX)  NULL,
    [URLReferrer]      NVARCHAR(MAX)  NULL,
    [ErrorSource]      NVARCHAR(MAX)  NULL,
    [ErrorTargetSite]  NVARCHAR(MAX)  NULL,
    [QueryString]      NVARCHAR(MAX)  NULL,
    CONSTRAINT [PK_ErrorLog] PRIMARY KEY CLUSTERED ([ErrorLogId] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
GO
