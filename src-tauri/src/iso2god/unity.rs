use reqwest as http;
use serde::Deserialize;
use serde_aux::prelude::*;

use anyhow::Error;

use std::time::Duration;

use hex;

use std::fmt;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct TitleList {
    pub items: Vec<Title>,
    pub count: u32,
    pub pages: u32,
    pub page: u32,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Title {
    #[serde(rename = "TitleID")]
    pub title_id: String,

    #[serde(rename = "HBTitleID")]
    pub hb_title_id: String,

    pub name: String,

    #[serde(deserialize_with = "deserialize_bool_from_anything")]
    pub link_enabled: bool,

    pub title_type: TitleType,

    #[serde(deserialize_with = "deserialize_number_from_string")]
    pub covers: u32,

    #[serde(deserialize_with = "deserialize_number_from_string")]
    pub updates: u32,

    #[serde(rename = "MediaIDCount")]
    #[serde(deserialize_with = "deserialize_number_from_string")]
    pub media_id_count: String,

    #[serde(deserialize_with = "deserialize_number_from_string")]
    pub user_count: String,

    pub newest_content: String,
}

impl fmt::Display for Title {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "    Type: {}", self.title_type)?;
        writeln!(f, "Title ID: {}", self.title_id)?;
        write!(f, "    Name: {}", self.name)
    }
}

#[derive(Deserialize, PartialEq, Eq)]
pub enum TitleType {
    #[serde(rename = "")]
    Xbox,

    #[serde(rename = "360")]
    Xbox360,

    Xbox1,
}

impl fmt::Display for TitleType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Xbox => write!(f, "Xbox title"),
            Self::Xbox360 => write!(f, "Xbox 360 title"),
            Self::Xbox1 => write!(f, "Xbox One title"),
        }
    }
}

pub struct Client {
    client: http::Client,
}

impl Client {
    pub fn new() -> Result<Client, Error> {
        let client = http::Client::builder()
            .connect_timeout(10 * Duration::SECOND)
            .user_agent(format!(
                "{} / {} {}",
                env!("CARGO_PKG_NAME"),
                env!("CARGO_PKG_VERSION"),
                env!("CARGO_PKG_REPOSITORY"),
            ))
            .build()?;

        Ok(Client { client })
    }

    fn get(&self, method: &str) -> http::RequestBuilder {
        self.client.get(format!("http://xboxunity.net/{}", method))
    }

    async fn search(&self, search_str: &str) -> Result<TitleList, Error> {
        // TODO: pagination support?

        let response = self
            .get("Resources/Lib/TitleList.php")
            .query(&[
                ("search", search_str),
                // TODO: are all of these necessary?
                ("page", "0"),
                ("count", "10"),
                ("sort", "3"),
                ("direction", "1"),
                ("category", "0"),
                ("filter", "0"),
            ])
            .send()
            .await?
            .json()
            .await;

        // return but cast to our own error type
        response.map_err(|e| e.into())
    }

    pub async fn find_xbox_360_title_id(&self, title_id: &[u8; 4]) -> Result<Option<Title>, Error> {
        let title_id = hex::encode_upper(title_id);

        let title_list = self.search(&title_id).await?;

        let title = title_list
            .items
            .into_iter()
            .find(|title| title.title_type == TitleType::Xbox360 && title.title_id == title_id);

        Ok(title)
    }
}
