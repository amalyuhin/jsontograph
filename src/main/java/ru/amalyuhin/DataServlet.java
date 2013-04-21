package ru.amalyuhin;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import ru.amalyuhin.managers.TdbManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Random;

/**
 * Created with IntelliJ IDEA.
 * User: amalyuhin
 * Date: 20.04.13
 * Time: 18:03
 * To change this template use File | Settings | File Templates.
 */
public class DataServlet extends HttpServlet {
    private final String DATA_DIR = "/data";

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String BASE_DIR = getServletContext().getRealPath("/");
        String fileName = "wine.owl";

        try {
            String tdbDir = BASE_DIR + "tdb";
            String file = DATA_DIR + "/" + fileName;

            TdbManager tdbManager = new TdbManager(tdbDir);
            tdbManager.addNamedModel(file);
            tdbManager.close();

            resp.getOutputStream().println("Ok!");

        } catch (Exception e) {
            resp.getOutputStream().println(e.getMessage());
        }
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String BASE_DIR = getServletContext().getRealPath("/");
        final String FILE_FIELD_NAME = "onto_file";

        try {
            List<FileItem> items = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(req);

            for (FileItem item : items) {
                if (!item.isFormField()) {
                    String fieldName = item.getFieldName();

                    if (fieldName.equals(FILE_FIELD_NAME)) {
                        File uploadedFile = processUploadedFile(item);

                        String tdbDir = BASE_DIR + "tdb";
                        String file = DATA_DIR + "/" + uploadedFile.getName();

                        TdbManager tdbManager = new TdbManager(tdbDir);
                        tdbManager.addNamedModel(file);
                        tdbManager.close();
                    }
                }
            }

            resp.sendRedirect("/jsOntoGraph/index");

        } catch (Exception e) {
            throw new ServletException("Cannot parse multipart request.", e);
        }
    }

    private File processUploadedFile(FileItem item) throws Exception{
        String dir = getServletContext().getRealPath("/WEB-INF/classes/data");

        File uploadedFile = new File(dir + "/" + item.getName());

        if (uploadedFile.exists()) {
            do {
                Random random = new Random();
                String path = dir + "/" + random.nextInt();

                uploadedFile = new File(path);

            } while (uploadedFile.exists());
        }

        if (uploadedFile.createNewFile()) {
            item.write(uploadedFile);
        } else {
            throw new FileUploadException("Cannot create file.");
        }

        return uploadedFile;
    }
}
