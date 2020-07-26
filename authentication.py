'''
Created on Wed Jul  1 22:29:50 2020

@author: narim
'''
import numpy as np
import  sys 
import cv2
data =10

import skimage.io as io
print(data)



from skimage.color import rgb2gray
from skimage.filters import threshold_otsu,gaussian
import argparse
from commonfunctions import *
from skimage.morphology import dilation,square,erosion,skeletonize, thin,binary_erosion, binary_dilation
from skimage import feature
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from PIL import Image
from skimage.measure import find_contours
from skimage.filters import median
from skimage.morphology import disk
from skimage.draw import rectangle
from skimage import data, filters
from skimage.filters import threshold_local
import math  
from skimage import util 
import tensorflow as tf
from tensorflow import keras
import io
from PIL import Image
import time
import binascii
import struct


def binarizeImage(Image):
    Image[Image<127]=1
    Image[Image>=127]=0
    return Image

  
def BinarizingImage(Image):
    Image[Image<127]=0
    Image[Image>=127]=1
    return Image
  
def featuresextraction(Image):
    featurevector=[]
    error= False
    
    #resize   
    if( (Image.shape[0]<28) or (Image.shape[1]<28)) :
        resizedimg = cv2.resize(Image.astype(np.uint8), (28,28), interpolation = cv2.INTER_LINEAR)
    else:
        resizedimg = cv2.resize(Image.astype(np.uint8), (28,28), interpolation = cv2.INTER_AREA)
    resized=BinarizingImage(resizedimg)
    #Height/Width 
    vertical_img = np.sum(resized,axis=1)
    result1 = np.where(vertical_img >= 1)
    if(len(result1[0])>0):
        height=result1[0][-1]-result1[0][0]
        horizontal_img = np.sum(resized,axis=0)
        result2 = np.where(horizontal_img >= 1)  
        width=result2[0][-1]-result2[0][0]
        ratio=height/width
        featurevector.append(ratio)
    
        #NumberOfBlackPixels/NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(resized)
        NumberOfBlackPixels = 784 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/NumberOfWhitePixels
        featurevector.append(ratioB2W)
        #NumberOfHorizontalTransitions
        for j in range(28):
            transitionsVertical=0
            flag=0
            i=0
            while(i<28):
                if(resized[j][i]==1 and flag==0): #white
                    transitionsVertical+=1
                    flag=1
                elif(resized[j][i]==0 and flag==1): #black
                    transitionsVertical+=1
                    flag=0
                i+=1
            featurevector.append(transitionsVertical)
        #NumberOfVerticalTransitions
        for j in range(28):
            transitionsVertical=0
            flag=0
            i=0
            while(i<28):
                if(resized[i][j]==1 and flag==0): #white
                    transitionsVertical+=1
                    flag=1
                elif(resized[i][j]==0 and flag==1): #black
                    transitionsVertical+=1
                    flag=0
                i+=1
            featurevector.append(transitionsVertical)
        #Baseline location vertical
        xline= thin(resized)
        horizontal_img = np.sum(xline,axis=1)
        blur=gaussian(horizontal_img)
        PeakValue= np.argmax(blur)
        featurevector.append(PeakValue+1)
        #Baseline location horizontal
        xline= thin(resized)
        horizontal_img = np.sum(xline,axis=0)
        blur=gaussian(horizontal_img)
        PeakValue= np.argmax(blur)
        featurevector.append(PeakValue+1)
      
        #detect holes
        transitionsVertical=0
        flag=0
        i=0
        while(i<28):
            if (resized[i,13]==1 and flag==0): #white
                transitionsVertical+=1
                flag=1
            elif(resized[i,13]==0 and flag==1): #black
                transitionsVertical+=1
                flag=0
            i+=1      
            if(transitionsVertical>= 3):
                featurevector.append(1)
                x=1
            else:
                featurevector.append(0)
                x=0
        
        #4 regions
        Region1= resized[0:13,0:13]
        Region2= resized[0:13,14:27]
        Region3= resized[14:27,0:13]
        Region4= resized[14:27,14:27]
        #Black Pixels in Region 1/ White Pixels in Region 1
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 2/ White Pixels in Region 2
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 3/ White Pixels in Region 3
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 4/ White Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 1/ Black Pixels in Region 2
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 3/ Black Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 1/ Black Pixels in Region 3
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 2/ Black Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 1/ Black Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 2/ Black Pixels in Region 3
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
       
        #HorizontalProjection
        horizontal_img = np.sum(resized,axis=1) #sum on x-axis (rows) 
        featurevector=np.concatenate((featurevector,horizontal_img))
        #VerticalProjection
        vertical_img = np.sum(resized,axis=0) #sum on x-axis (rows) 
        featurevector=np.concatenate((featurevector,vertical_img))
        #28 x 28
        A=np.array(resized).flatten()
        featurevector=np.concatenate((featurevector,A))
    else:
        error = True
        
    return featurevector,error

def erosion(img, size=(3,3)):    
    edgex = math.floor(size[0]/2)
    edgey = math.floor(size[1]/2)
    new_img = np.zeros([img.shape[0], img.shape[1]]) 
    for x in range(edgex, img.shape[0]-edgex):
        for y in range(edgey, img.shape[1]-edgey):
            colorArray = []
            for fx in range(size[0]):
                for fy in range(size[1]):
                    colorArray.append(img[x+fx-edgex][y+fy-edgey])
            new_img[x][y] = np.min(colorArray)
    return new_img

def dilation(img, size=(3,3)):    
    edgex = math.floor(size[0]/2)
    edgey = math.floor(size[1]/2)
    new_img = np.zeros([img.shape[0], img.shape[1]])
    for x in range(edgex, img.shape[0]-edgex):
        for y in range(edgey, img.shape[1]-edgey):
            colorArray = []
            for fx in range(size[0]):
                for fy in range(size[1]):
                    colorArray.append(img[x+fx-edgex][y+fy-edgey])
            new_img[x][y] = np.max(colorArray)
    return new_img

def Medianfilter(imagegray,rowsfilter,colsfilter):
    rows= imagegray.shape[0]
    cols= imagegray.shape[1]
    imagemedian=np.zeros((rows,cols))
    edgex= int(rowsfilter/2)
    edgey= int(colsfilter/2)
    for i in range(edgex,(rows-edgex)):
        for j in range(edgey,(cols-edgey)):
            colorarray=np.zeros((rowsfilter,colsfilter))
            for k in range(rowsfilter):
                for l in range(colsfilter):
                    colorarray[k][l]=imagegray[i+k-edgex][j+l-edgey]
            colorarray.sort()
            imagemedian[i][j]=np.median(colorarray)
    return imagemedian

def detectBlank(char):
    rows = char.shape[0]
    cols = char.shape[1]
    area = rows*cols
    NumberOfWhitePixels = cv2.countNonZero(char.astype(np.uint8))
    NumberOfBlackPixels = area - NumberOfWhitePixels
    if(NumberOfWhitePixels/NumberOfBlackPixels> 0.01):
        return False
    else:
        return True
    
def remove_black_background(img):
    image = img.copy()
    rows = img.shape[0]
    cols = img.shape[1]
    gray = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    gray = 255*(gray < 128).astype(np.uint8)
    zerorows=np.all(gray == 0, axis=1)
    zerocols=np.all(gray == 0, axis=0)
    arr=[]
    arr2=[]
    for i in range(rows-1):
        if(zerorows[i]==True):
            arr.append(i)       
    for i in range(cols-1):
        if(zerocols[i]==True):
           arr2.append(i)
    lengthofzerorows = len(arr)
    lengthofzerocols = len(arr2)
    if(lengthofzerorows/rows> 0.1 or lengthofzerocols/cols>0.2):
        changed = True
    else:
        changed = False
    image = np.delete(image, arr, axis=0) 
    image = np.delete(image, arr2, axis=1)
    
    return image

def detectCard(image,lowthresh,highthresh,erode):
    image= ((rgb2gray(image))*255).astype(np.uint8) 
    image=canny(image.astype(np.uint8),low_threshold= lowthresh,high_threshold= highthresh)
    rows = image.shape[0]
    cols = image.shape[1]
    area = rows*cols
    kernel1size = int(rows/3) #m 3ala 100
    kernel2size = int(cols/3) #m eala 100 dodo
    kernel = np.ones((kernel1size,kernel2size), np.uint8)
    image = binary_dilation(image.astype(np.uint8), kernel)
    if(erode):
        image=binary_erosion(image.astype(np.uint8),kernel)      
    boxes=[]
    bounding_boxes=[]
    contours = find_contours(image,0.8)
    for contour in contours:
        box = []
        minX = int(np.min(contour[:,1]))
        minY = int(np.min(contour[:,0]))
        maxX = int(np.max(contour[:,1]))
        maxY = int(np.max(contour[:,0]))
        box.append(minX)
        box.append(maxX)
        box.append(minY)
        box.append(maxY)
        boxes.append(box)
    maximum=0
    max_index =1
    counter=0
    for box in boxes:
         width = abs(box[1]-box[0])
         length = abs(box[3]-box[2])
         contourarea = width*length
         if(length>0):
             if((width/length) > 1.5 and (width/length)<2 ): 
                 if(contourarea/area > 0.2):
                     if(maximum<contourarea):
                         maximum=contourarea
                         max_index=counter
                         bounding_boxes.append(box)
                         counter = counter+1
    return bounding_boxes,max_index
   
def extractPlateNumbersandLetters(imagegray,lowthresh,highthresh,dilate,dilateagain):
    rows= imagegray.shape[0]
    cols= imagegray.shape[1]
    imagegray = imagegray[0:int(rows/2),0:int(4*cols/5)]
    rows= imagegray.shape[0]
    cols= imagegray.shape[1]
    area = rows*cols
    imagegray= ((rgb2gray(imagegray))*255).astype(np.uint8) 
    imagegray=canny(imagegray.astype(np.uint8),low_threshold= lowthresh,high_threshold= highthresh)
    kernelsize=cols/3 #m 3ala 100 
    if(cols>500):
        kernelsize=kernelsize+2
    if(cols>700):
        kernelsize=kernelsize+3
    if(cols>1000):
        kernelsize=kernelsize+5
    if(cols>1500):
        kernelsize=kernelsize+10
    if(dilate):
        kernelsize = kernelsize +2 
    if(dilateagain):
        kernelsize = kernelsize+5 
    horizontalkernel = np.ones((1,int(kernelsize)), np.uint8)
    card = binary_dilation(imagegray.astype(np.uint8), horizontalkernel) 
    boxes=[]
    bounding_boxes=[]
    contours = find_contours(card,0.8)
    for contour in contours:
        box = []
        minX = int(np.min(contour[:,1]))
        minY = int(np.min(contour[:,0]))
        maxX = int(np.max(contour[:,1]))
        maxY = int(np.max(contour[:,0]))
        box.append(minX)
        box.append(maxX)
        box.append(minY)
        box.append(maxY)
        boxes.append(box)
    for box in boxes:
        width = abs(box[1]-box[0])
        length = abs(box[3]-box[2])
        contourarea = width*length
        if( (box[1]-box[0]!=0) and (box[3]-box[2]!=0) ):
              if(contourarea/area>0.1 and contourarea/area<0.3):
                if(length/width > 0.1 and length/width <0.2): 
                    if(width>(0.5*cols) and length>(0.2*rows) ): 
                      if(width<(0.8*cols) and length<(0.5*rows)):
                          bounding_boxes.append(box)

    return bounding_boxes
    
def callDetectCard(image):
    copy = image.copy() 
    bounding_boxes,max_index= detectCard(image,70,140,False)
    if(len(bounding_boxes)>0):
             card = copy[(bounding_boxes[max_index][2]):(bounding_boxes[max_index][3]) , (bounding_boxes[ max_index][0]):(bounding_boxes[max_index][1])]
    else:
            boundingbox,index = detectCard(image,70,140,True)     
            if(len(boundingbox)>0):
                card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
            else:
                     boundingbox,index = detectCard(image,50,100,False)
                     if(len(boundingbox)>0):
                         card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                     else:
                              boundingbox,index = detectCard(image,50,100,True)
                              if(len(boundingbox)>0):
                                  card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                              else:
                                  boundingbox,index = detectCard(image,25,50,False)
                                  if(len(boundingbox)>0):
                                      card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                  else:
                                      boundingbox,index = detectCard(image,25,50,True)     
                                      if(len(boundingbox)>0):
                                            card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                      else:
                                            boundingbox,index = detectCard(image,10,20,False)
                                            if(len(boundingbox)>0):
                                                 card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                            else:
                                                  boundingbox,index = detectCard(image,10,20,True)
                                                  if(len(boundingbox)>0):
                                                      card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                                  else:
                                                      card= remove_black_background(image) 
    
    return card

def callextractPlateNumbersandLetters(card):
    numbersandlettersfound= False
    img_with_boxes =((rgb2gray(card))*255).astype(np.uint8)
    bounding_boxes = extractPlateNumbersandLetters(card,120,240,False,False)
    if(len(bounding_boxes)==1): 
            numbersandlettersfound= True
            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
    else:
        bounding_boxes= extractPlateNumbersandLetters(card,110,220,False,False)
        if(len(bounding_boxes)==1): 
            numbersandlettersfound= True
            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
        else:
             bounding_boxes= extractPlateNumbersandLetters(card,100,200,False,False)
             if(len(bounding_boxes)==1):
                 numbersandlettersfound= True
                 numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
             else:
                     bounding_boxes= extractPlateNumbersandLetters(card,70,140,False,False)
                     if(len(bounding_boxes)==1):
                        numbersandlettersfound= True
                        numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                     else:
                        bounding_boxes= extractPlateNumbersandLetters(card,60,120,False,False)
                        if(len(bounding_boxes)==1):
                            numbersandlettersfound= True
                            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                        else:
                            bounding_boxes= extractPlateNumbersandLetters(card,50,100,False,False)
                            if(len(bounding_boxes)==1):
                                numbersandlettersfound= True
                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                            else:
                                bounding_boxes= extractPlateNumbersandLetters(card,40,80,False,False)
                                if(len(bounding_boxes)==1):
                                        numbersandlettersfound= True
                                        numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                else:
                                        bounding_boxes= extractPlateNumbersandLetters(card,10,140,False,False)
                                        if(len(bounding_boxes)==1):
                                            numbersandlettersfound= True
                                            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                        else:
                                            numbersandlettersfound= False                                     
    if(numbersandlettersfound == False):
        bounding_boxes = extractPlateNumbersandLetters(card,120,240,True,False)
        if(len(bounding_boxes)==1): 
                numbersandlettersfound= True
                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
        else:
            bounding_boxes= extractPlateNumbersandLetters(card,110,220,True,False)
            if(len(bounding_boxes)==1): 
                numbersandlettersfound= True
                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
            else:
                 bounding_boxes= extractPlateNumbersandLetters(card,100,200,True,False)
                 if(len(bounding_boxes)==1):
                     numbersandlettersfound= True
                     numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                 else:
                        bounding_boxes= extractPlateNumbersandLetters(card,70,140,True,False)
                        if(len(bounding_boxes)==1):
                             numbersandlettersfound= True
                             numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                        else:
                             bounding_boxes= extractPlateNumbersandLetters(card,60,120,True,False)
                             if(len(bounding_boxes)==1):
                                numbersandlettersfound= True
                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                             else:
                                bounding_boxes= extractPlateNumbersandLetters(card,50,100,True,False)
                                if(len(bounding_boxes)==1):
                                    numbersandlettersfound= True
                                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                else:
                                    bounding_boxes= extractPlateNumbersandLetters(card,40,80,True,False)
                                    if(len(bounding_boxes)==1):
                                            numbersandlettersfound= True
                                            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                    else:
                                            bounding_boxes= extractPlateNumbersandLetters(card,10,140,True,False)
                                            if(len(bounding_boxes)==1):
                                                numbersandlettersfound= True
                                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
        if(numbersandlettersfound == False):
            bounding_boxes = extractPlateNumbersandLetters(card,120,240,True,True)
            if(len(bounding_boxes)==1): 
                    numbersandlettersfound= True
                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
            else:
                bounding_boxes= extractPlateNumbersandLetters(card,110,220,True,True)
                if(len(bounding_boxes)==1): 
                    numbersandlettersfound= True
                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                else:
                     bounding_boxes= extractPlateNumbersandLetters(card,100,200,True,True)
                     if(len(bounding_boxes)==1):
                         numbersandlettersfound= True
                         numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                     else:
                            bounding_boxes= extractPlateNumbersandLetters(card,70,140,True,True)
                            if(len(bounding_boxes)==1):
                                 numbersandlettersfound= True
                                 numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                            else:
                                 bounding_boxes= extractPlateNumbersandLetters(card,60,120,True,True)
                                 if(len(bounding_boxes)==1):
                                    numbersandlettersfound= True
                                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                 else:
                                    bounding_boxes= extractPlateNumbersandLetters(card,50,100,True,True)
                                    if(len(bounding_boxes)==1):
                                        numbersandlettersfound= True
                                        numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                    else:
                                        bounding_boxes= extractPlateNumbersandLetters(card,40,80,True,True)
                                        if(len(bounding_boxes)==1):
                                                numbersandlettersfound= True
                                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                        else:
                                                bounding_boxes= extractPlateNumbersandLetters(card,10,140,True,True)
                                                if(len(bounding_boxes)==1):
                                                    numbersandlettersfound= True
                                                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                                else:
                                                    numbersandlettersfound= False  
                                                    numbersandletters = np.zeros((15,15))
    return numbersandlettersfound,numbersandletters


def extractCharacters(image):
    image =cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]    
    rows = image.shape[0]
    cols = image.shape[1]
    characters=[]
    final_characters = []
    horizontal_kernel = np.ones((1,int(cols/10)), np.uint8)
    vertical_kernel =np.ones((int(rows/2),1), np.uint8)    
    horizontal_lines = binary_erosion(image.astype(np.uint8), horizontal_kernel) 
    horizontal_lines = binary_dilation(horizontal_lines.astype(np.uint8), horizontal_kernel) 
    vertical_lines = binary_erosion(image.astype(np.uint8), vertical_kernel) 
    vertical_lines = binary_dilation(vertical_lines.astype(np.uint8), vertical_kernel) 
    cnts = cv2.findContours(horizontal_lines.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        cv2.drawContours(image, [c], -1, (0,0,0), 2)
    cnts = cv2.findContours(vertical_lines.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        cv2.drawContours(image, [c], -1, (0,0,0), 2)
    col = int(cols/7)
    for i in range(7):
        character = image[: ,(i*col):((i+1)*col)]
        characters.append(character)
    for char in  characters: 
        image = char
        copy = np.copy(image)
        charrows = char.shape[0]
        charcols = char.shape[1]
        image = median(image,disk(1))
        kernel1size = int(charrows/5) #m 3ala 25
        kernel = np.ones((kernel1size,kernel1size),np.uint8)
        image=binary_erosion(image,kernel)
        copy = np.copy(image)
        kernelsize1=int(charrows/5) #m 3ala 10
        kernelsize2=int(charcols/5) #m 3ala 10
        kernel = np.ones((kernelsize1,kernelsize2),np.uint8)
        image=binary_dilation(image,kernel)
        contours = find_contours(image,0.8)
        boxes= []
        bounding_boxes = [] 
        for contour in contours:
            box = []
            minX = (int(np.min(contour[:,1])))
            minY = (int(np.min(contour[:,0])))
            maxX = (int(np.max(contour[:,1])))
            maxY = (int(np.max(contour[:,0])))
            if(minY- (int(charrows/10)) >0):
                if(minY>charrows/4 and minY<charrows/2):
                    minY = minY- (int(charrows/10))
            if(maxY + (int(charrows/10))<charrows):
                if(maxY<3*charrows/4 and maxY>charrows/2):
                    maxY = maxY + (int(charrows/10))
            box.append(minX)
            box.append(maxX)
            box.append(minY)
            box.append(maxY)
            boxes.append(box)
        maximum=0
        max_index =1
        counter=0
        for box in boxes:      
            width = abs(box[1]-box[0])
            length = abs(box[3]-box[2])
            contourarea = width*length
            if(width<int(4*charcols/5) ):
                if(length>int(charrows/3) and length<int(4*charrows/5)):
                     if(maximum<contourarea):
                         maximum=contourarea
                         max_index=counter
                         bounding_boxes.append(box)
                         counter = counter+1
        if(len(bounding_boxes)==1):
            if( ((bounding_boxes[0][3] + 3) <charrows) and  ((bounding_boxes[0][0] - 3) >0) and  ((bounding_boxes[0][1] + 3) <charcols)): 
                finalcharacter = copy[(bounding_boxes[0][2]):(bounding_boxes[0][3] + 3) , (bounding_boxes[0][0]-3):(bounding_boxes[0][1]+3) ]
            else:
                 finalcharacter = copy[(bounding_boxes[0][2]):(bounding_boxes[0][3]) , (bounding_boxes[0][0]):(bounding_boxes[0][1]) ]
            final_characters.append(finalcharacter)
        elif(len(bounding_boxes)>1):
            finalcharacter = copy[(bounding_boxes[max_index][2]):(bounding_boxes[max_index][3] + 3) , (bounding_boxes[max_index][0]-3):(bounding_boxes[max_index][1]+3) ]
            final_characters.append(finalcharacter)
        elif(len(bounding_boxes)==0):
            final_characters.append(copy)
    return final_characters

    
    
modeldigits = keras.Sequential([
        keras.layers.InputLayer(input_shape = (938,)),
        keras.layers.Dense(600,activation= tf.nn.relu),
        keras.layers.Dense(300,activation= tf.nn.relu),
        keras.layers.Dense(9,activation= tf.nn.softmax)
        ])
modeldigits.load_weights('my_model_weights_digits.h5')

modelletters = keras.Sequential([
        keras.layers.InputLayer(input_shape = (938,)),
        keras.layers.Dense(600,activation= tf.nn.relu),
        keras.layers.Dense(300,activation= tf.nn.relu),
        keras.layers.Dense(17,activation= tf.nn.softmax)
        ])
modelletters.load_weights('my_model_weights_letters.h5')

def predictiondigits(Image):
        Features_Vector = []
        Features,error = featuresextraction(Image)
        if(error==False):
            Features_Vector.append(Features)
            Features_Vector=np.asarray(Features_Vector)
            predictions = modeldigits.predict(Features_Vector)
            pred = np.argmax(predictions[0])
        else:
            pred = -1
        return pred 
    
def predictionletters(Image):
        Features_Vector = []
        Features,error = featuresextraction(Image)
        if(error==False):
            Features_Vector.append(Features)
            Features_Vector=np.asarray(Features_Vector)
            predictions = modelletters.predict(Features_Vector)
            pred = np.argmax(predictions[0])
        else:
            pred = -1
        return pred 
    
#data = [255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 1, 0, 72, 0, 72, 0, 0, 255, 219, 0, 67, 0, 14, 10, 11, 13, 11, 9, 14, 13, 12, 13, 16, 15, 14, 17, 22, 36, 23, 22, 20, 20, 22, 44, 32, 33, 26, 36, 52, 46, 55, 54, 51, 46, 50, 50, 58, 65, 83, 70, 58, 61, 78, 62, 50, 50, 72, 98, 73, 78, 86, 88, 93, 94, 93, 56, 69, 102, 109, 101, 90, 108, 83, 91, 93, 89, 255, 219, 0, 67, 1, 15, 16, 16, 22, 19, 22, 42, 23, 23, 42, 89, 59, 50, 59, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 255, 192, 0, 17, 8, 0, 67, 0, 90, 3, 1, 34, 0, 2, 17, 1, 3, 17, 1, 255, 196, 0, 27, 0, 0, 2, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 0, 2, 4, 6, 1, 7, 255, 196, 0, 46, 16, 0, 2, 2, 1, 3, 4, 0, 6, 0, 6, 3, 0, 0, 0, 0, 0, 1, 2, 0, 3, 17, 4, 18, 33, 19, 49, 65, 81, 5, 20, 34, 50, 97, 129, 35, 51, 66, 82, 113, 161, 145, 177, 241, 255, 196, 0, 25, 1, 0, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 3, 0, 5, 255, 196, 0, 32, 17, 0, 3, 1, 0, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 17, 3, 33, 49, 4, 18, 65, 50, 81, 97, 255, 218, 0, 12, 3, 1, 0, 2, 17, 3, 17, 0, 63, 0, 64, 23, 230, 43, 64, 123, 146, 48, 33, 151, 109, 78, 89, 185, 43, 244, 129, 234, 99, 171, 80, 90, 157, 152, 25, 7, 32, 226, 93, 89, 152, 41, 83, 245, 99, 13, 159, 18, 55, 254, 138, 57, 125, 101, 122, 132, 167, 40, 168, 16, 99, 129, 222, 69, 189, 107, 185, 171, 80, 25, 118, 131, 144, 115, 156, 192, 81, 131, 65, 177, 215, 42, 190, 120, 154, 180, 250, 122, 41, 2, 203, 47, 80, 196, 239, 36, 140, 136, 97, 82, 237, 5, 231, 140, 211, 165, 109, 129, 54, 18, 135, 183, 7, 17, 169, 212, 181, 40, 173, 96, 37, 79, 5, 189, 69, 86, 87, 180, 51, 171, 6, 243, 149, 237, 147, 54, 86, 83, 229, 16, 171, 51, 59, 113, 98, 191, 111, 212, 51, 78, 31, 125, 29, 245, 251, 46, 134, 212, 178, 218, 172, 235, 219, 196, 191, 76, 17, 145, 21, 211, 99, 212, 249, 175, 236, 30, 12, 105, 70, 173, 44, 93, 165, 72, 97, 46, 226, 249, 42, 186, 126, 146, 242, 112, 53, 218, 6, 213, 64, 189, 115, 122, 128, 227, 142, 227, 188, 27, 215, 42, 86, 77, 80, 208, 177, 235, 129, 233, 254, 35, 23, 174, 7, 100, 209, 80, 152, 112, 122, 95, 133, 88, 250, 94, 169, 179, 146, 50, 20, 119, 48, 26, 230, 21, 88, 136, 203, 176, 168, 236, 59, 159, 243, 49, 117, 110, 166, 210, 155, 217, 27, 177, 195, 120, 158, 239, 107, 92, 189, 132, 187, 118, 201, 158, 59, 149, 233, 234, 173, 28, 252, 57, 27, 90, 198, 189, 202, 170, 6, 78, 79, 113, 25, 184, 85, 78, 141, 149, 45, 71, 111, 117, 60, 17, 57, 154, 153, 171, 96, 245, 185, 87, 95, 34, 48, 249, 195, 171, 176, 29, 77, 228, 17, 129, 192, 238, 34, 185, 77, 96, 87, 79, 78, 155, 73, 69, 107, 163, 168, 217, 118, 75, 14, 63, 38, 21, 43, 61, 82, 21, 51, 248, 204, 207, 162, 27, 40, 110, 144, 123, 213, 120, 33, 187, 16, 61, 67, 13, 90, 223, 96, 122, 198, 8, 238, 177, 111, 142, 91, 218, 120, 141, 38, 158, 98, 44, 247, 109, 109, 140, 155, 88, 113, 159, 115, 222, 166, 208, 48, 199, 62, 79, 169, 109, 37, 226, 250, 109, 107, 16, 99, 171, 129, 159, 56, 255, 0, 201, 235, 168, 119, 42, 7, 62, 132, 202, 184, 190, 189, 203, 208, 167, 189, 52, 30, 141, 83, 161, 250, 142, 76, 217, 166, 212, 245, 9, 15, 199, 168, 156, 0, 167, 151, 24, 252, 201, 212, 193, 36, 28, 48, 154, 71, 45, 194, 79, 240, 202, 162, 95, 76, 126, 193, 76, 15, 76, 123, 139, 244, 218, 227, 140, 62, 61, 77, 95, 48, 159, 221, 44, 143, 149, 45, 118, 77, 92, 31, 209, 242, 64, 25, 156, 177, 28, 137, 161, 114, 216, 68, 4, 177, 30, 60, 192, 86, 72, 76, 159, 50, 201, 97, 22, 6, 4, 140, 30, 49, 49, 101, 33, 129, 193, 43, 130, 8, 134, 210, 186, 163, 146, 232, 31, 140, 115, 50, 245, 9, 39, 39, 36, 249, 133, 76, 240, 124, 67, 157, 4, 102, 150, 220, 41, 10, 150, 176, 172, 182, 72, 7, 180, 53, 90, 183, 210, 53, 157, 59, 3, 2, 177, 117, 119, 109, 98, 15, 57, 148, 123, 13, 231, 10, 112, 1, 201, 49, 90, 213, 140, 100, 240, 125, 240, 91, 152, 216, 149, 217, 119, 76, 31, 63, 153, 208, 116, 159, 78, 253, 71, 110, 165, 64, 99, 32, 114, 63, 83, 153, 248, 78, 152, 234, 237, 8, 70, 43, 79, 184, 231, 152, 254, 212, 170, 141, 37, 148, 37, 238, 89, 148, 133, 70, 96, 73, 63, 129, 30, 97, 53, 184, 35, 166, 186, 60, 179, 54, 218, 203, 75, 86, 219, 70, 67, 19, 156, 254, 160, 116, 203, 103, 68, 245, 173, 47, 110, 123, 145, 142, 34, 202, 236, 178, 187, 48, 114, 174, 135, 4, 71, 58, 166, 83, 66, 217, 253, 88, 236, 61, 153, 55, 29, 43, 151, 45, 102, 15, 200, 156, 180, 244, 206, 199, 248, 187, 43, 5, 136, 245, 39, 92, 249, 99, 42, 157, 55, 168, 216, 44, 41, 98, 248, 50, 163, 86, 216, 28, 87, 251, 19, 47, 4, 211, 131, 15, 244, 224, 152, 90, 233, 118, 165, 173, 82, 187, 83, 190, 76, 207, 129, 220, 96, 201, 146, 20, 228, 247, 241, 46, 195, 131, 212, 195, 60, 241, 152, 69, 99, 187, 129, 218, 100, 76, 130, 8, 239, 53, 212, 113, 201, 61, 160, 163, 130, 237, 12, 64, 108, 224, 247, 34, 71, 57, 33, 107, 224, 123, 131, 107, 25, 92, 21, 238, 124, 120, 158, 179, 251, 63, 84, 84, 16, 160, 90, 78, 90, 246, 3, 200, 94, 39, 77, 240, 199, 210, 232, 168, 172, 82, 203, 110, 170, 252, 2, 65, 201, 231, 223, 224, 78, 91, 113, 11, 140, 126, 230, 173, 14, 165, 180, 215, 173, 136, 161, 136, 247, 26, 107, 5, 164, 118, 90, 141, 62, 158, 203, 1, 101, 27, 148, 100, 145, 231, 159, 48, 26, 183, 85, 96, 120, 13, 216, 204, 21, 124, 75, 115, 90, 109, 82, 166, 204, 5, 2, 94, 219, 69, 141, 147, 140, 227, 7, 62, 102, 124, 183, 56, 243, 214, 116, 39, 189, 148, 102, 57, 35, 141, 179, 211, 91, 103, 238, 31, 238, 2, 195, 140, 159, 18, 163, 81, 102, 62, 227, 255, 0, 50, 83, 70, 142, 67, 204, 186, 114, 192, 30, 210, 73, 61, 1, 2, 40, 195, 15, 243, 46, 126, 252, 120, 245, 36, 145, 25, 199, 172, 126, 185, 226, 242, 78, 121, 146, 73, 223, 135, 4, 63, 202, 111, 212, 215, 167, 39, 253, 73, 36, 74, 240, 43, 211, 161, 214, 86, 155, 40, 59, 70, 70, 63, 234, 101, 14, 193, 73, 7, 28, 201, 36, 199, 155, 249, 6, 60, 51, 218, 236, 119, 101, 143, 136, 61, 199, 220, 146, 64, 135, 71, 255, 217]
data = sys.argv[1]
bytearray(data[:4])
bytearray(b'\xff\xd8\xff\xe0')
imagename = str( time.strftime("%Y%m%d-%H%M%S")) +".jpeg"
f = open(imagename, 'wb')
f.write(bytearray(data))
f.close()
image = cv2.imread(imagename)
plateletters = sys.argv[2]
platenumbers = sys.argv[3]
numberOfLetters = len(plateletters)
numberOfNumbers = len(platenumbers)
card = callDetectCard(image)  
predictedNumbers = [] 
predictedLetters = []  
numberOfBlank=0     
wrongPicture=False                                       
numbersandlettersfound,numbersandletters = callextractPlateNumbersandLetters(card)
if(numbersandlettersfound):
    #show_images([numbersandletters])
    final_characters=extractCharacters(numbersandletters) 
    for i in range (numberOfNumbers):
        final_characters[i] = final_characters[i].astype(np.uint8)  
        final_characters[i]=final_characters[i]*255
        pred = predictiondigits(final_characters[i])
        if(pred == -1):
            numberOfBlank = numberOfBlank=1
        elif(pred==0):
            predictedNumbers.append("١")
        elif(pred==1):
            predictedNumbers.append("٢")
        elif(pred==2):
            predictedNumbers.append("٣")   
        elif(pred==3):
            predictedNumbers.append("٤")
        elif(pred==4):
            predictedNumbers.append("٥")  
        elif(pred==5):
            predictedNumbers.append("٦")  
        elif(pred==6):
            predictedNumbers.append("٧")   
        elif(pred==7):
            predictedNumbers.append("٨") 
        elif(pred==8):
            predictedNumbers.append("٩")
        else:
            numberOfBlank = numberOfBlank=1
            predictedLetters.append("nothing found")
            #print("nothing found")      
        #print(pred+1)
    for i in range (numberOfLetters,0,-1):
        final_characters[7-i] = final_characters[7-i].astype(np.uint8)  
        final_characters[7-i]=final_characters[7-i]*255
        pred = predictionletters(final_characters[7-i])
        if(pred == -1):
            numberOfBlank = numberOfBlank=1
        elif(pred==0):
            predictedLetters.append("أ")
            #print("أ")
        elif(pred==1):
            predictedLetters.append("ب")
            #print("ب")
        elif(pred==2):
            predictedLetters.append("ج")
            #print("ج")
        elif(pred==3):
            predictedLetters.append("د")
            #print("د")
        elif(pred==4):
            predictedLetters.append("ر")
            #print("ر")
        elif(pred==5):
            predictedLetters.append("س")
            #print("س")
        elif(pred==6):
            predictedLetters.append("ص")
            #print("ص")
        elif(pred==7):
            predictedLetters.append("ط")
            #print("ط")
        elif(pred==8):
            predictedLetters.append("ع")
            #print("ع")
        elif(pred==9):
            predictedLetters.append("ف")
            #print("ف")
        elif(pred==10):
            predictedLetters.append("ق")
            #print("ق")
        elif(pred==11):
            predictedLetters.append("ل")
            #print("ل")
        elif(pred==12):
            predictedLetters.append("م")
            #print("م")
        elif(pred==13):
            predictedLetters.append("ن")
            #print("ن")
        elif(pred==14):
            predictedLetters.append("و")
            #print("و")
        elif(pred==15):
            predictedLetters.append("ه")
            #print("ه")
        elif(pred==16):
            predictedLetters.append("ي")
            #print("ي")
        else:
            numberOfBlank = numberOfBlank=1
            predictedLetters.append("nothing found")
            #print("nothing found")    
    if(numberOfBlank<=1):
        correctdigits=0
        correctletters=0
        digitsVerified = False
        lettersVerified = False
        for i in range(numberOfNumbers):
            if(len(platenumbers)==len(predictedNumbers)):
                if(platenumbers[i]==predictedNumbers[i]):
                    correctdigits=correctdigits+1
                else:
                    if(platenumbers[i]=="٦" and predictedNumbers[i] == "١"):
                        correctdigits=correctdigits+1
                    elif(platenumbers[i]=="٩" and predictedNumbers[i] == "١"):
                        correctdigits=correctdigits+1
                    elif(platenumbers[i]=="٢" and predictedNumbers[i] == "٣"):
                        correctdigits=correctdigits+1
                    elif(platenumbers[i]=="٣" and predictedNumbers[i] == "٢"):
                        correctdigits=correctdigits+1    
            else:
                wrongPicture = True
        for i in range(numberOfLetters):
            if(len(plateletters)==len(predictedLetters)):
                if(plateletters[i]==predictedLetters[(numberOfLetters-1)-i]):
                    correctletters=correctletters+1 
                else:
                    if(plateletters[i]=="ق" and predictedLetters=="ف" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="ف" and predictedLetters=="ق" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="ص" and predictedLetters=="س" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="س" and predictedLetters=="ص" ):
                        correctletters=correctletters+1
                    elif(plateletters[i]=="ع" and predictedLetters=="ج" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="ج" and predictedLetters=="ع" ):
                        correctletters=correctletters+1
            else:
                wrongPicture = True
        if(correctdigits>= math.ceil(numberOfNumbers/2)):
            digitsVerified = True
            
        if(correctletters>= math.ceil(numberOfLetters/2)):
            lettersVerified = True
            
    else:
        wrongPicture = True
else:
        wrongPicture = True
    
if(wrongPicture):
    print("Please enter another picture")
elif(digitsVerified and lettersVerified):
    print("Letters and digits entered are correct")
elif(digitsVerified and ~lettersVerified):
    print("Letters entered are incorrect")
elif(lettersVerified and ~digitsVerified):
    print("Digits entered are incorrect") 
else:
    print("nothing")

       