#include <curl/curl.h>
#include <curl/easy.h>
#include <cstdio>
#include <iostream>
#include <stdexcept>
#include <stdio.h>
#include <string.h>
#include <vector>

#include "datadownloader.h"
using namespace AlphaVantage;

const char* DataDownloader::apikey = "BXWE0TLJQVV39MST";
const char* DataDownloader::filepath = "/home/yoong93/stock/server/alpha_vantage/";
const char* DataDownloader::alpha_url = "https://www.alphavantage.co/query?function=";


void DataDownloader::setconfig(const char* symbol){
    m_symbol = symbol;
    
    int arr_length = strlen(m_symbol.c_str()) + strlen(filepath) + 4; // .csv
    char src_fname_arr[arr_length];
    strcpy(src_fname_arr, filepath);
    strcat(src_fname_arr, m_symbol.c_str());
    strcat(src_fname_arr, ".csv");
    src_fname = src_fname_arr;
    
    char dest_fname_arr[arr_length+7]; // _padded
    strcpy(dest_fname_arr, filepath);
    strcat(dest_fname_arr, m_symbol.c_str());
    strcat(dest_fname_arr, "_padded");
    strcat(dest_fname_arr, ".csv");
    pad_fname = dest_fname_arr;
}    
    
int DataDownloader::delete_file(){
    int result = remove(pad_fname.c_str());
    result *= remove(src_fname.c_str());
    return result;
}

const char* DataDownloader::get_fname(){
    return pad_fname.c_str();
}
            
int DataDownloader::download(){
    if(m_symbol.length() < 1){
        return -1;
    }
    
    if(DataDownloader::download_file() > 0){
        if(DataDownloader::padded_file() > 0){
            return 1;
        }
    }

    return -1;
}

int DataDownloader::padded_file(){
    FILE* src_fp;
    FILE* dest_fp;
    int header_found = 0;
    char *buffer = new char[1000];
    
    src_fp = fopen(src_fname.c_str(), "r");
    if(src_fp == NULL){
        return -1;
    }

    dest_fp = fopen(pad_fname.c_str(), "w");
    std::string delimiter = ","; // need this for compiler type reference when concating

    while(fgets(buffer, 1000, src_fp) != NULL){
        buffer [ strcspn(buffer, "\r\n") ] = 0;
        if (!header_found) { 
            strcat(buffer, (delimiter + "symbol").c_str());
            //pad interval
            strcat(buffer, (delimiter + "interval_type" + delimiter + "interval").c_str());
            strcat(buffer, "\n\0");
            header_found = 1;
        } else {
            //padd symbol
            strcat(buffer, (delimiter + m_symbol).c_str());
            //pad interval
            strcat(buffer, (delimiter + "d" + delimiter + "1").c_str());
            strcat(buffer, "\n\0");
        }
        fputs(buffer, dest_fp);
    };
    
    fclose(src_fp);
    fclose(dest_fp);

    delete(buffer);
    return 1;
}

int DataDownloader::download_file(){
    CURL* curl;
    FILE* fp;
    const char* function = "TIME_SERIES_DAILY"; // hardcoded for now.
    
    //function symbol, api, datatype
    int url_length = strlen(alpha_url) + strlen(function) + m_symbol.length() + strlen(DataDownloader::apikey) + 8 + 9 + 13; 
    char url_arr[url_length]; 
    const char* url = url_arr;
    strcpy(url_arr, alpha_url);
    strcat(url_arr, function);
    strcat(url_arr, "&symbol=");
    strcat(url_arr, m_symbol.c_str());
    strcat(url_arr,"&apikey=");
    strcat(url_arr, DataDownloader::apikey);
    strcat(url_arr, "&datatype=csv");
    
    CURLcode res;
    try {
        curl = curl_easy_init();
        if(curl)
            fp = fopen(src_fname.c_str(), "wb");
            curl_easy_setopt(curl, CURLOPT_URL, url);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
            curl_easy_setopt(curl, CURLOPT_NOPROGRESS, 0);
            // Perform a file transfer synchronously.
            res = curl_easy_perform(curl);
            curl_easy_cleanup(curl);
            fclose(fp);
    } catch (const std::exception& ex) {
        //TODO:: HOWTOCATCH invalid apicall? read csv and check?
        std::cout << "ERROR: error during download: " << ex.what() << std::endl;
        return -1;
    }
    return 1;
}