## Infrastructure of the Archive {.main-subtitle2}

The ISIC Archive consists of two (broad) components. The main component you, the user, typically interact with is the [Image Gallery](#!/topWithHeader/onlyHeaderTop/gallery). It provides a convenient and visually interactive way of browsing the data made available by the second component, the API and backend.
Here, we want to give you a brief overview over how the data within the backend (directly available via an API) is structured, in case you want to create new applications. Please also feel free to reach out to our support team at support@isic-archive.com.

The following classes of objects are stored in the backend:
*	contributors
*	cohorts
*	accessions (images)
*	segmentation masks
*	metadata files
*	collections (still being finalized)
*	users
*	studies
*	annotations
*	annotation masks (selected areas of an image belonging to a feature)

The first three (contributors, cohorts, and accessions) are nested, such that each image belongs to precisely one cohort, and each cohort is associated with precisely one contributor who is responsible for providing the metadata and determines license terms and visibility of the images being provided. Metadata is provided on a per-cohort basis, which means that filenames must be unique (regardless of subfolder in which users may store them within ZIP files!).

Each accession (image) can have one (as well as none or multiple) segmentation masks associated with it, which allows flexible selection of sub-parts of image components (mostly foreground = lesion, and background = healthy skin).

A novel feature, collections, allows the user to create a set of images for a specified purpose, such as a new research project. In short, images that are marked as public (i.e. those that can be viewed without the need to log into the archive website) can be bundled into arbitrary sets, called collections, for which the user can then generate a DOI. This will make re-using existing assets much easier for future research projects.

Studies describe tasks that users can perform with sets of images. Traditionally, this meant collecting image-level annotations (i.e. users answering questions such as, "do you perceive feature X being present in this lesion?"). Next to these image-level annotations, the archive already supports users selecting specific parts of an image and storing them as annotation masks, which would answer a question such as, "where in the image do you perceive feature X?"

In addition to the Gallery, which uses the API and backend, we envision that the user community can create their own applications, which can utilize the API. To allow any such application access to images that haven't been made (fully) public yet, we already support an OAuth2 login workflow. Please email us at support@isic-archive.com to inquire about how we can help you integrate your application with the ISIC Archive API.
