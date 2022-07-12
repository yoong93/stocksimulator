#ifndef DATADOWNLOADER_H // include guard
#define DATADOWNLOADER_H

#include <string>
// TODO : environ variable later 
namespace AlphaVantage
{
    class DataDownloader
    {
        public:
            //DataDownloader();
            int download();
            int delete_file();
            const char* get_fname();
            void setconfig(const char*);
        
        private:
            // TODO : environ variable later 
            static const char* filepath;
            static const char* alpha_url;
            static const char* apikey;
            
            std::string m_symbol;
            std::string src_fname;
            std::string pad_fname;    
            
            int download_file();
            int padded_file();
            std::string padded_filepath; 
            
    };
}

#endif 